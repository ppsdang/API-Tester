import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ApiCollections from './pages/ApiCollections';
import FlowList from './pages/FlowList';
import FlowBuilder from './pages/FlowBuilder';
import FlowExecution from './pages/FlowExecution';
import Environments from './pages/Environments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apis" element={<ApiCollections />} />
          <Route path="flows" element={<FlowList />} />
          <Route path="flows/new" element={<FlowBuilder />} />
          <Route path="flows/:id" element={<FlowBuilder />} />
          <Route path="flows/:id/executions/:executionId" element={<FlowExecution />} />
          <Route path="environments" element={<Environments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
