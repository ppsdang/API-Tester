import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowService, apiService, aiService } from '../services/api';
import { Plus, Trash2, Save, Sparkles, Play } from 'lucide-react';
import type { FlowStep, ApiEndpoint } from '../types';

export default function FlowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Partial<FlowStep>[]>([]);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const { data: flow } = useQuery({
    queryKey: ['flow', id],
    queryFn: () => flowService.getFlow(id!),
    enabled: !!id,
  });

  const { data: apis } = useQuery({
    queryKey: ['apis'],
    queryFn: apiService.getApis,
  });

  useEffect(() => {
    if (flow) {
      setName(flow.name);
      setDescription(flow.description || '');
      setSteps(flow.steps || []);
    }
  }, [flow]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      return id ? flowService.updateFlow(id, data) : flowService.createFlow(data);
    },
    onSuccess: (savedFlow) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      if (!id) {
        navigate(`/flows/${savedFlow.id}`);
      }
    },
  });

  const aiGenerateMutation = useMutation({
    mutationFn: aiService.generateFlow,
    onSuccess: (data) => {
      setName(data.flow.name);
      setDescription(data.flow.description);
      setSteps(data.flow.steps.map((step, index) => ({
        ...step,
        stepOrder: index,
      })));
      setShowAI(false);
      alert(`Flow generated! AI reasoning: ${data.reasoning}`);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      name,
      description,
      steps: steps.map((step, index) => ({
        ...step,
        stepOrder: index,
      })),
    });
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepOrder: steps.length,
        name: `Step ${steps.length + 1}`,
        method: 'GET',
        url: '',
        assertions: [{ type: 'status', expected: 200 }],
      },
    ]);
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleAIGenerate = () => {
    aiGenerateMutation.mutate({
      prompt: aiPrompt,
      context: 'Generate a comprehensive flow with proper variable extraction and assertions',
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Flow' : 'Create New Flow'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAI(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Sparkles size={18} />
            AI Assistant
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || !name}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saveMutation.isPending ? 'Saving...' : 'Save Flow'}
          </button>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="text-purple-600" />
                AI Flow Generator
              </h2>
            </div>

            <div className="p-6">
              <label className="label">Describe the flow you want to create</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Create a flow that logs in as a user, fetches their profile, and updates their email address"
                className="input h-32"
              />
              <p className="text-sm text-gray-500 mt-2">
                The AI will analyze your available APIs and generate a complete flow with
                steps, variable extraction, and assertions.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowAI(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={aiGenerateMutation.isPending || !aiPrompt}
                className="btn btn-primary"
              >
                {aiGenerateMutation.isPending ? 'Generating...' : 'Generate Flow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flow Details */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Flow Details</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Flow Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter flow name"
              className="input"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this flow tests"
              className="input h-20"
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Flow Steps</h2>
          <button onClick={addStep} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Step
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No steps yet. Add a step or use the AI Assistant to generate a flow.
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={step.name || ''}
                        onChange={(e) => updateStep(index, { name: e.target.value })}
                        placeholder="Step name"
                        className="input"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteStep(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Method</label>
                    <select
                      value={step.method || 'GET'}
                      onChange={(e) => updateStep(index, { method: e.target.value })}
                      className="input"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                      <option>PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Select API (optional)</label>
                    <select
                      value={step.apiId || ''}
                      onChange={(e) => {
                        const selectedApi = apis?.find((a) => a.id === e.target.value);
                        updateStep(index, {
                          apiId: e.target.value || undefined,
                          method: selectedApi?.method,
                          url: selectedApi?.path,
                        });
                      }}
                      className="input"
                    >
                      <option value="">Manual configuration</option>
                      {apis?.map((api) => (
                        <option key={api.id} value={api.id}>
                          {api.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">URL</label>
                  <input
                    type="text"
                    value={step.url || ''}
                    onChange={(e) => updateStep(index, { url: e.target.value })}
                    placeholder="/api/endpoint or https://api.example.com/endpoint"
                    className="input"
                  />
                </div>

                <div className="mt-4">
                  <label className="label">Request Body (JSON)</label>
                  <textarea
                    value={
                      typeof step.requestBody === 'string'
                        ? step.requestBody
                        : JSON.stringify(step.requestBody || {}, null, 2)
                    }
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateStep(index, { requestBody: parsed });
                      } catch {
                        updateStep(index, { requestBody: e.target.value });
                      }
                    }}
                    placeholder='{"key": "value"}'
                    className="input h-24 font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
