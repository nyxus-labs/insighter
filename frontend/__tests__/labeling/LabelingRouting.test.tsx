import React from 'react';
import { render, screen } from '@testing-library/react';
import LabelingToolPage from '@/app/dashboard/labeling/[toolId]/page';
import { useUser } from '@/contexts/UserContext';
import { notFound } from 'next/navigation';

// Mock the hooks and components
jest.mock('@/contexts/UserContext');
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));
jest.mock('@/lib/tools/registry', () => ({
  ToolRenderer: ({ tool, projectId }: any) => (
    <div data-testid="tool-renderer">
      {tool.name} - {projectId}
    </div>
  ),
}));

// Mock lucide-react to avoid issues with SVG components in tests
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
  Tag: () => <div data-testid="icon-tag" />,
  ShieldCheck: () => <div data-testid="icon-shield-check" />,
  Loader2: () => <div data-testid="icon-loader" />,
}));

describe('LabelingToolPage', () => {
  const mockUser = { name: 'Test User' };

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    jest.clearAllMocks();
  });

  it('renders the labeling tool correctly when toolId is valid', async () => {
    // Note: In Next.js 15+, params is a Promise. We simulate it here.
    const params = Promise.resolve({ toolId: 'prodigy' });
    
    // We use a wrapper or direct render since it's a client component
    render(<LabelingToolPage params={params} />);

    // Check if tool name is rendered (Prodigy Annotation Environment)
    expect(await screen.findByText(/Prodigy/i)).toBeInTheDocument();
    
    // Check if ToolRenderer is rendered with correct props
    const renderer = screen.getByTestId('tool-renderer');
    expect(renderer).toBeInTheDocument();
    expect(renderer).toHaveTextContent('Prodigy - global-labeling-workspace');
  });

  it('calls notFound when toolId is invalid', async () => {
    const params = Promise.resolve({ toolId: 'invalid-tool' });
    
    render(<LabelingToolPage params={params} />);

    // Wait for the async params to resolve and for the effect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(notFound).toHaveBeenCalled();
  });

  it('calls notFound when tool category is not Labeling', async () => {
    const params = Promise.resolve({ toolId: 'jupyter-notebook' });
    
    render(<LabelingToolPage params={params} />);

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(notFound).toHaveBeenCalled();
  });
});
