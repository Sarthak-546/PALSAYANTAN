import React from 'react';

export type CPRFeedback = {
  compressionsPerMinute: number | null;
  compressionQuality: 'GOOD' | 'TOO_FAST' | 'TOO_SLOW' | 'INSUFFICIENT_RECOIL' | null;
  elbowAngleFeedback: 'LOCK_ELBOWS' | 'GOOD_FORM' | null;
  voiceFeedback: string | null;
};

export class CPRTracker {
  private wristYHistory: number[] = [];
  private readonly MAX_HISTORY = 90; // ~3 seconds at 30fps
  private lastCompressionTime: number = 0;
  private compressionCount: number = 0;
  private isCompressing: boolean = false;
  private readonly COMPRESSION_THRESHOLD = 0.05; // normalized Y movement threshold
  private readonly RECOIL_THRESHOLD = 0.02; // minimum rebound for good recoil
  private lastVoiceFeedbackTime: number = 0;
  private readonly VOICE_COOLDOWN = 3000; // 3 seconds between voice feedback

  constructor() {
    // Bind methods
    this.update = this.update.bind(this);
  }

  /**
   * Update tracker with latest pose data
   */
  update(poseData: {
    leftWrist: { x: number; y: number } | null;
    rightWrist: { x: number; y: number } | null;
    leftElbow: { x: number; y: number } | null;
    rightElbow: { x: number; y: number } | null;
    leftShoulder: { x: number; y: number } | null;
    rightShoulder: { x: number; y: number } | null;
  }): CPRFeedback {
    const now = Date.now();

    // Calculate average wrist Y position (lower Y = higher on screen)
    const leftY = poseData.leftWrist?.y ?? 0.5;
    const rightY = poseData.rightWrist?.y ?? 0.5;
    const avgWristY = (leftY + rightY) / 2;

    // Add to history
    this.wristYHistory.push(avgWristY);
    if (this.wristYHistory.length > this.MAX_HISTORY) {
      this.wristYHistory.shift();
    }

    // Detect compression (moving down) vs release (moving up)
    const isMovingDown =
      this.wristYHistory.length >= 2 &&
      this.wristYHistory[this.wristYHistory.length - 1] >
        this.wristYHistory[this.wristYHistory.length - 2] + this.COMPRESSION_THRESHOLD;

    const isMovingUp =
      this.wristYHistory.length >= 2 &&
      this.wristYHistory[this.wristYHistory.length - 1] <
        this.wristYHistory[this.wristYHistory.length - 2] - this.RECOIL_THRESHOLD;

    // State machine for compression counting
    if (isMovingDown && !this.isCompressing) {
      this.isCompressing = true;
      this.compressionCount++;
      this.lastCompressionTime = now;
    }

    if (isMovingUp && this.isCompressing) {
      this.isCompressing = false;
    }

    // Calculate BPM (compressions per minute)
    let bpm: number | null = null;
    if (this.compressionCount >= 2 && this.lastCompressionTime > 0) {
      const timeSpan = now - this.lastCompressionTime;
      if (timeSpan > 0) {
        // Estimate BPM based on time between first and last compression in window
        const estimatedBPM = (60000 * (this.compressionCount - 1)) / timeSpan;
        bpm = Math.round(estimatedBPM);
      }
    }

    // Determine compression quality
    let compressionQuality: CPRFeedback['compressionQuality'] = null;
    if (bpm !== null) {
      if (bpm < 100) {
        compressionQuality = 'TOO_SLOW';
      } else if (bpm > 120) {
        compressionQuality = 'TOO_FAST';
      } else {
        // Check for sufficient recoil (wrists returning to original position)
        const hasGoodRecoil =
          this.wristYHistory.length >= 10 &&
          Math.max(...this.wristYHistory.slice(-10)) -
            Math.min(...this.wristYHistory.slice(-10)) >
            this.RECOIL_THRESHOLD * 2;

        compressionQuality = hasGoodRecoil ? 'GOOD' : 'INSUFFICIENT_RECOIL';
      }
    }

    // Calculate elbow angle feedback
    let elbowAngleFeedback: CPRFeedback['elbowAngleFeedback'] = null;
    if (
      poseData.leftElbow &&
      poseData.rightElbow &&
      poseData.leftShoulder &&
      poseData.rightShoulder
    ) {
      const leftAngle = this.calculateAngle(
        poseData.leftShoulder,
        poseData.leftElbow,
        poseData.leftWrist ?? { x: 0, y: 0 }
      );
      const rightAngle = this.calculateAngle(
        poseData.rightShoulder,
        poseData.rightElbow,
        poseData.rightWrist ?? { x: 0, y: 0 }
      );

      const avgAngle = (leftAngle + rightAngle) / 2;

      // Arms should be relatively straight (~160-180 degrees)
      if (avgAngle < 150) {
        elbowAngleFeedback = 'LOCK_ELBOWS';
      } else {
        elbowAngleFeedback = 'GOOD_FORM';
      }
    }

    // Generate voice feedback
    let voiceFeedback: string | null = null;
    if (now - this.lastVoiceFeedbackTime > this.VOICE_COOLDOWN) {
      if (elbowAngleFeedback === 'LOCK_ELBOWS') {
        voiceFeedback = 'Lock your elbows';
        this.lastVoiceFeedbackTime = now;
      } else if (compressionQuality === 'TOO_SLOW') {
        voiceFeedback = 'Push faster';
        this.lastVoiceFeedbackTime = now;
      } else if (compressionQuality === 'TOO_FAST') {
        voiceFeedback = 'Push slower';
        this.lastVoiceFeedbackTime = now;
      } else if (compressionQuality === 'INSUFFICIENT_RECOIL') {
        voiceFeedback = 'Let chest fully recoil';
        this.lastVoiceFeedbackTime = now;
      } else if (
        compressionQuality === 'GOOD' &&
        elbowAngleFeedback === 'GOOD_FORM'
      ) {
        voiceFeedback = 'Good compressions';
        this.lastVoiceFeedbackTime = now;
      }
    }

    return {
      compressionsPerMinute: bpm,
      compressionQuality,
      elbowAngleFeedback,
      voiceFeedback
    };
  }

  /**
   * Calculate angle between three points (shoulder-elbow-wrist)
   */
  private calculateAngle(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ): number {
    const ba = { x: a.x - b.x, y: a.y - b.y };
    const bc = { x: c.x - b.x, y: c.y - b.y };

    const dotProduct = ba.x * bc.x + ba.y * bc.y;
    const magnitudeBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
    const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

    const angle = Math.acos(dotProduct / (magnitudeBA * magnitudeBC));
    return (angle * 180) / Math.PI; // Convert to degrees
  }

  /**
   * Reset tracker state
   */
  reset(): void {
    this.wristYHistory = [];
    this.lastCompressionTime = 0;
    this.compressionCount = 0;
    this.isCompressing = false;
    this.lastVoiceFeedbackTime = 0;
  }
}

/**
 * Hook for using CPR tracker in React components
 */
export function useCPRTracker() {
  const [feedback, setFeedback] = React.useState<CPRFeedback>({
    compressionsPerMinute: null,
    compressionQuality: null,
    elbowAngleFeedback: null,
    voiceFeedback: null
  });

  const trackerRef = React.useRef(new CPRTracker());

  const updateTracker = React.useCallback(
    (poseData: {
      leftWrist: { x: number; y: number } | null;
      rightWrist: { x: number; y: number } | null;
      leftElbow: { x: number; y: number } | null;
      rightElbow: { x: number; y: number } | null;
      leftShoulder: { x: number; y: number } | null;
      rightShoulder: { x: number; y: number } | null;
    }) => {
      const newFeedback = trackerRef.current.update(poseData);
      setFeedback(newFeedback);
      return newFeedback;
    },
    []
  );

  const resetTracker = React.useCallback(() => {
    trackerRef.current.reset();
    setFeedback({
      compressionsPerMinute: null,
      compressionQuality: null,
      elbowAngleFeedback: null,
      voiceFeedback: null
    });
  }, []);

  return { feedback, updateTracker, resetTracker };
}