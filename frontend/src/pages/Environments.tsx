import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentService } from '../services/api';
import { Plus, Trash2, Edit, Database } from 'lucide-react';
import type { Environment } from '../types';

export default function Environments() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Environment | null>(null);

  const queryClient = useQueryClient();

  const { data: environments, isLoading } = useQuery({
    queryKey: ['environments'],
    queryFn: environmentService.getEnvironments,
  });

  const createMutation = useMutation({
    mutationFn: environmentService.createEnvironment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Environment> }) =>
      environmentService.updateEnvironment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: environmentService.deleteEnvironment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      baseUrl: formData.get('baseUrl') as string,
      variables: {},
      headers: {},
      isDefault: formData.get('isDefault') === 'on',
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Environments</h1>
          <p className="text-gray-500 mt-1">Manage different environments for your flows</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Environment
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {editing ? 'Edit Environment' : 'Add Environment'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editing?.name}
                    required
                    placeholder="Development, QA, Production..."
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editing?.description}
                    placeholder="Describe this environment"
                    className="input h-20"
                  />
                </div>

                <div>
                  <label className="label">Base URL</label>
                  <input
                    type="url"
                    name="baseUrl"
                    defaultValue={editing?.baseUrl}
                    placeholder="https://api.example.com"
                    className="input"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    defaultChecked={editing?.isDefault}
                  />
                  <label htmlFor="isDefault" className="text-sm">
                    Set as default environment
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn btn-primary"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Environments List */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : environments && environments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {environments.map((env) => (
            <div key={env.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Database className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{env.name}</h3>
                    {env.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(env);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this environment?')) {
                        deleteMutation.mutate(env.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {env.description && (
                <p className="text-sm text-gray-600 mb-2">{env.description}</p>
              )}

              {env.baseUrl && (
                <p className="text-sm text-gray-500 font-mono">{env.baseUrl}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Database className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-4">No environments yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary mt-4"
          >
            Add your first environment
          </button>
        </div>
      )}
    </div>
  );
}
