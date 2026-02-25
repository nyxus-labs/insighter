
import { 
  Database, 
  Code, 
  Activity, 
  Tag, 
  Rocket, 
  Filter,
  Beaker,
  BarChart2,
  Cpu,
  Sparkles,
  PieChart,
  BookOpen,
  GitBranch,
  Cloud,
  Terminal,
  Workflow,
  Box,
  Share2,
  Scan
} from 'lucide-react';

export type Tool = {
  id: string;
  name: string;
  description: string;
  icon: any; // Using any to avoid serializing React nodes issues in some contexts, but ideally React.ReactNode
  category: string;
  path: string; // This will now hint at the environment type
  environmentType: 'notebook' | 'data' | 'experiment' | 'labeling' | 'deployment' | 'settings' | 'default';
  iconColor?: string;
  version?: string;
  supportedEvents?: string[];
  allowedSources?: string[]; // ACL: Which tools can send messages to this tool
  capabilities?: {
    inputTypes?: string[];
    outputTypes?: string[];
  };
};

export const TOOLS: Tool[] = [
  // Data Science
  { 
    id: 'python', 
    name: 'Python', 
    description: 'Core language for data science.', 
    icon: Code, 
    category: 'Data Science', 
    path: 'notebook', 
    environmentType: 'notebook', 
    iconColor: 'text-yellow-400', 
    version: '3.11',
    supportedEvents: ['DATA_LOAD', 'EXECUTE_CODE'],
    allowedSources: ['sql', 'excel', 'pandas', 'r', 'system'], // Only allow data tools + system
    capabilities: {
      inputTypes: ['text/python', 'application/json'],
      outputTypes: ['text/plain', 'application/json', 'image/png']
    }
  },
  { id: 'r', name: 'R', description: 'Language for statistical computing.', icon: Code, category: 'Data Science', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-600', version: '4.3' },
  { id: 'jupyter', name: 'Jupyter', description: 'Interactive computing environments.', icon: Code, category: 'Data Science', path: 'notebook', environmentType: 'notebook', iconColor: 'text-orange-500', version: 'Lab 4.0' },
  { id: 'numpy', name: 'NumPy', description: 'Fundamental package for array computing.', icon: Box, category: 'Data Science', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-400' },
  { id: 'pandas', name: 'Pandas', description: 'Data structures and analysis tools.', icon: Database, category: 'Data Science', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-500' },
  { id: 'scipy', name: 'SciPy', description: 'Fundamental algorithms for scientific computing.', icon: Beaker, category: 'Data Science', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-300' },

  // Data Analytics
  { id: 'sql', name: 'SQL', description: 'Standard language for relational databases.', icon: Database, category: 'Data Analytics', path: 'data', environmentType: 'data', iconColor: 'text-slate-300' },
  { id: 'excel', name: 'Excel', description: 'Spreadsheet software for data analysis.', icon: BarChart2, category: 'Data Analytics', path: 'data', environmentType: 'data', iconColor: 'text-green-600' },
  { id: 'tableau', name: 'Tableau', description: 'Visual analytics platform.', icon: BarChart2, category: 'Data Analytics', path: 'data', environmentType: 'data', iconColor: 'text-blue-600' },
  { id: 'powerbi', name: 'Power BI', description: 'Interactive data visualization software.', icon: BarChart2, category: 'Data Analytics', path: 'data', environmentType: 'data', iconColor: 'text-yellow-500' },
  { id: 'google-analytics', name: 'Google Analytics', description: 'Web analytics service.', icon: BarChart2, category: 'Data Analytics', path: 'data', environmentType: 'data', iconColor: 'text-orange-400' },

  // Machine Learning / AI
  { id: 'scikit-learn', name: 'Scikit-learn', description: 'Machine learning in Python.', icon: Cpu, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-orange-400' },
  { id: 'tensorflow', name: 'TensorFlow', description: 'End-to-end open source machine learning platform.', icon: Cpu, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-orange-500' },
  { id: 'pytorch', name: 'PyTorch', description: 'Open source machine learning framework.', icon: Cpu, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-red-400' },
  { id: 'keras', name: 'Keras', description: 'Deep learning API running on top of TensorFlow.', icon: Cpu, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-red-500' },
  { id: 'xgboost', name: 'XGBoost', description: 'Optimized distributed gradient boosting library.', icon: Activity, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-green-500' },
  { id: 'lightgbm', name: 'LightGBM', description: 'Gradient boosting framework that uses tree based learning.', icon: Activity, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-blue-500' },
  { id: 'hugging-face', name: 'Hugging Face', description: 'Platform for building ML applications.', icon: Sparkles, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-yellow-400' },
  { id: 'opencv', name: 'OpenCV', description: 'Open source computer vision library.', icon: Scan, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-blue-500' },
  { id: 'openai', name: 'OpenAI', description: 'AI research and deployment company.', icon: Sparkles, category: 'Machine Learning / AI', path: 'experiments', environmentType: 'experiment', iconColor: 'text-green-400' },

  // Data Cleaning
  { id: 'openrefine', name: 'OpenRefine', description: 'Power tool for working with messy data.', icon: Filter, category: 'Data Cleaning', path: 'data', environmentType: 'data', iconColor: 'text-blue-400' },
  { id: 'trifacta', name: 'Trifacta', description: 'Data wrangling software.', icon: Filter, category: 'Data Cleaning', path: 'data', environmentType: 'data', iconColor: 'text-orange-400' },

  // Visualization
  { id: 'matplotlib', name: 'Matplotlib', description: 'Comprehensive library for creating static, animated, and interactive visualizations.', icon: PieChart, category: 'Visualization', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-500' },
  { id: 'seaborn', name: 'Seaborn', description: 'Statistical data visualization.', icon: PieChart, category: 'Visualization', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-300' },
  { id: 'plotly', name: 'Plotly', description: 'Interactive graphing library.', icon: PieChart, category: 'Visualization', path: 'notebook', environmentType: 'notebook', iconColor: 'text-purple-500' },
  { id: 'd3js', name: 'D3.js', description: 'JavaScript library for producing dynamic, interactive data visualizations.', icon: Code, category: 'Visualization', path: 'notebook', environmentType: 'notebook', iconColor: 'text-orange-500' },

  // Reporting
  { id: 'latex', name: 'LaTeX', description: 'Document preparation system.', icon: BookOpen, category: 'Reporting', path: 'notebook', environmentType: 'notebook', iconColor: 'text-slate-400' },
  { id: 'markdown', name: 'Markdown', description: 'Lightweight markup language.', icon: Code, category: 'Reporting', path: 'notebook', environmentType: 'notebook', iconColor: 'text-slate-300' },
  { id: 'jupyter-book', name: 'Jupyter Book', description: 'Build beautiful, publication-quality books and documents.', icon: BookOpen, category: 'Reporting', path: 'notebook', environmentType: 'notebook', iconColor: 'text-orange-400' },

  // Labeling
  { id: 'label-studio', name: 'Label Studio', description: 'Multi-type data labeling and annotation.', icon: Tag, category: 'Labeling', path: 'labeling', environmentType: 'labeling', iconColor: 'text-blue-500' },
  { id: 'prodigy', name: 'Prodigy', description: 'Scriptable annotation tool.', icon: Tag, category: 'Labeling', path: 'labeling', environmentType: 'labeling', iconColor: 'text-yellow-500' },

  // Collaboration
  { id: 'git', name: 'Git', description: 'Distributed version control system.', icon: GitBranch, category: 'Collaboration', path: 'settings', environmentType: 'settings', iconColor: 'text-red-500' },
  { id: 'github', name: 'GitHub', description: 'Platform for hosting and version control.', icon: GitBranch, category: 'Collaboration', path: 'settings', environmentType: 'settings', iconColor: 'text-slate-800' },
  { id: 'gitlab', name: 'GitLab', description: 'DevOps platform.', icon: GitBranch, category: 'Collaboration', path: 'settings', environmentType: 'settings', iconColor: 'text-orange-600' },
  { id: 'slack', name: 'Slack', description: 'Messaging app for business.', icon: Share2, category: 'Collaboration', path: 'settings', environmentType: 'settings', iconColor: 'text-purple-500' },
  { id: 'jira', name: 'Jira', description: 'Issue tracking and project management.', icon: Activity, category: 'Collaboration', path: 'settings', environmentType: 'settings', iconColor: 'text-blue-600' },

  // Deployment
  { id: 'docker', name: 'Docker', description: 'Platform for developing, shipping, and running applications.', icon: Box, category: 'Deployment', path: 'deployment', environmentType: 'deployment', iconColor: 'text-blue-500' },
  { id: 'kubernetes', name: 'Kubernetes', description: 'Container orchestration system.', icon: Box, category: 'Deployment', path: 'deployment', environmentType: 'deployment', iconColor: 'text-blue-600' },
  { id: 'flask', name: 'Flask', description: 'Micro web framework written in Python.', icon: Rocket, category: 'Deployment', path: 'deployment', environmentType: 'deployment', iconColor: 'text-slate-400' },
  { id: 'django', name: 'Django', description: 'High-level Python web framework.', icon: Rocket, category: 'Deployment', path: 'deployment', environmentType: 'deployment', iconColor: 'text-green-700' },
  { id: 'fastapi', name: 'FastAPI', description: 'Modern, fast (high-performance), web framework for building APIs.', icon: Rocket, category: 'Deployment', path: 'deployment', environmentType: 'deployment', iconColor: 'text-teal-500' },
  { id: 'streamlit', name: 'Streamlit', description: 'Turn data scripts into shareable web apps.', icon: Rocket, category: 'Deployment', path: 'deployment', environmentType: 'deployment', iconColor: 'text-red-500' },

  // Cloud
  { id: 'aws', name: 'AWS', description: 'Amazon Web Services.', icon: Cloud, category: 'Cloud', path: 'settings', environmentType: 'settings', iconColor: 'text-orange-500' },
  { id: 'azure', name: 'Azure', description: 'Microsoft Cloud Computing Services.', icon: Cloud, category: 'Cloud', path: 'settings', environmentType: 'settings', iconColor: 'text-blue-500' },
  { id: 'google-cloud', name: 'Google Cloud', description: 'Google Cloud Platform.', icon: Cloud, category: 'Cloud', path: 'settings', environmentType: 'settings', iconColor: 'text-blue-400' },

  // IDE
  { id: 'vscode', name: 'VS Code', description: 'Code editor redefined.', icon: Terminal, category: 'IDE', path: 'notebook', environmentType: 'notebook', iconColor: 'text-blue-500' },
  { id: 'pycharm', name: 'PyCharm', description: 'Python IDE for professional developers.', icon: Terminal, category: 'IDE', path: 'notebook', environmentType: 'notebook' },
  { id: 'rstudio', name: 'RStudio', description: 'IDE for R.', icon: Terminal, category: 'IDE', path: 'notebook', environmentType: 'notebook' },

  // Automation
  { id: 'airflow', name: 'Apache Airflow', description: 'Platform to programmatically author, schedule and monitor workflows.', icon: Workflow, category: 'Automation', path: 'settings', environmentType: 'settings' },
  { id: 'luigi', name: 'Luigi', description: 'Python module to build complex pipelines of batch jobs.', icon: Workflow, category: 'Automation', path: 'settings', environmentType: 'settings' },
];

export const CATEGORIES = [
  'All',
  'Data Science',
  'Data Analytics',
  'Machine Learning / AI',
  'Data Cleaning',
  'Visualization',
  'Reporting',
  'Labeling',
  'Collaboration',
  'Deployment',
  'Cloud',
  'IDE',
  'Automation'
];
