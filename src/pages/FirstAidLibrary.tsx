import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { FirstAidCard } from '../components/first-aid/FirstAidCard';
import { emergencyScenarios } from '../data/emergencyScenarios';

export const FirstAidLibrary = () => {
  const navigate = useNavigate();
  const { voiceGuidance, setVoiceGuidance } = useEmergencySession();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter scenarios based on search and category
  const filteredScenarios = emergencyScenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!activeCategory) return matchesSearch;

    // For demo purposes, we'll categorize by ID prefix or content
    // In a real app, each scenario would have an explicit category property
    const categoryMatch =
      (activeCategory === 'CPR' && scenario.id === 'cpr') ||
      (activeCategory === 'BLEEDING' && scenario.id === 'bleeding') ||
      (activeCategory === 'BURNS' && scenario.id === 'burns') ||
      (activeCategory === 'CHOKING' && scenario.id === 'choking');

    return (!activeCategory || categoryMatch) && matchesSearch;
  });

  const handleScenarioSelect = (scenarioId: string) => {
    navigate(`/first-aid/${scenarioId}`);
  };

  const handleVoiceGuidanceToggle = () => {
    setVoiceGuidance(!voiceGuidance);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            FIRST AID ASSISTANT
          </h1>
          <Button
            variant={voiceGuidance ? 'outline' : 'secondary'}
            size="medium"
            onClick={handleVoiceGuidanceToggle}
            className="text-sm"
          >
            {voiceGuidance ? 'VOICE ON' : 'VOICE OFF'}
          </Button>
        </div>

        {/* Search and Categories */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search emergency procedure..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeCategory === null ? 'outline' : 'secondary'}
              onClick={() => setActiveCategory(null)}
              className="px-4 py-2"
            >
              ALL
            </Button>
            <Button
              variant={activeCategory === 'CPR' ? 'outline' : 'secondary'}
              onClick={() => setActiveCategory('CPR')}
              className="px-4 py-2"
            >
              CPR
            </Button>
            <Button
              variant={activeCategory === 'BLEEDING' ? 'outline' : 'secondary'}
              onClick={() => setActiveCategory('BLEEDING')}
              className="px-4 py-2"
            >
              BLEEDING
            </Button>
            <Button
              variant={activeCategory === 'BURNS' ? 'outline' : 'secondary'}
              onClick={() => setActiveCategory('BURNS')}
              className="px-4 py-2"
            >
              BURNS
            </Button>
            <Button
              variant={activeCategory === 'CHOKING' ? 'outline' : 'secondary'}
              onClick={() => setActiveCategory('CHOKING')}
              className="px-4 py-2"
            >
              CHOKING
            </Button>
          </div>
        </div>

        {/* Scenario Cards */}
        <div className="space-y-4">
          {filteredScenarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No scenarios match your search. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredScenarios.map(scenario => (
                <FirstAidCard
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={() => handleScenarioSelect(scenario.id)}
                />
              ))}

              {/* Make it responsive - 1 column on mobile, 2 on tablet, 3+ on desktop */}
              <div className="hidden sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScenarios.slice(0, 3).map(scenario => (
                  <div key={scenario.id} className="opacity-0">
                    {/* Spacer for grid alignment */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};