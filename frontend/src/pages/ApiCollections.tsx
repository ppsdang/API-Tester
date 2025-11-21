import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Upload, Trash2, FileJson, Globe } from 'lucide-react';

export default function ApiCollections() {
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<'swagger' | 'postman'>('swagger');
  const [importSource, setImportSource] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [jsonContent, setJsonContent] = useState('');

  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: apiService.getCollections,
  });

  const importMutation = useMutation({
    mutationFn: (data: { url?: string; json?: any }) => {
      return importType === 'swagger'
        ? apiService.importSwagger(data)
        : apiService.importPostman(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setShowImport(false);
      setUrl('');
      setJsonContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const handleImport = () => {
    if (importSource === 'url' && url) {
      importMutation.mutate({ url });
    } else if (importSource === 'file' && jsonContent) {
      try {
        const json = JSON.parse(jsonContent);
        importMutation.mutate({ json });
      } catch (error) {
        alert('Invalid JSON');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Collections</h1>
          <p className="text-gray-500 mt-1">Import and manage your API definitions</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Upload size={18} />
          Import APIs
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Import API Collection</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Import Type */}
              <div>
                <label className="label">Import Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={importType === 'swagger'}
                      onChange={() => setImportType('swagger')}
                    />
                    Swagger/OpenAPI
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={importType === 'postman'}
                      onChange={() => setImportType('postman')}
                    />
                    Postman Collection
                  </label>
                </div>
              </div>

              {/* Import Source */}
              <div>
                <label className="label">Source</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={importSource === 'url'}
                      onChange={() => setImportSource('url')}
                    />
                    URL
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={importSource === 'file'}
                      onChange={() => setImportSource('file')}
                    />
                    JSON Content
                  </label>
                </div>
              </div>

              {/* URL Input */}
              {importSource === 'url' && (
                <div>
                  <label className="label">URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/swagger.json"
                    className="input"
                  />
                </div>
              )}

              {/* JSON Input */}
              {importSource === 'file' && (
                <div>
                  <label className="label">JSON Content</label>
                  <textarea
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    placeholder="Paste your JSON here..."
                    className="input h-64 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowImport(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="btn btn-primary"
              >
                {importMutation.isPending ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections List */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {collection.source === 'swagger' ? (
                      <FileJson className="text-blue-600" size={20} />
                    ) : (
                      <Globe className="text-orange-600" size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{collection.source}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(collection.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {collection.description && (
                <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
              )}

              <div className="text-sm text-gray-500">
                {collection.apis.length} endpoints
              </div>

              {collection.sourceUrl && (
                <a
                  href={collection.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block truncate max-w-full"
                >
                  {collection.sourceUrl}
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Globe className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-4">No API collections yet</p>
          <button
            onClick={() => setShowImport(true)}
            className="btn btn-primary mt-4"
          >
            Import your first collection
          </button>
        </div>
      )}
    </div>
  );
}
