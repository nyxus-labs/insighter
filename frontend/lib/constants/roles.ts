
import { 
  Database, 
  Code, 
  Activity, 
  Cpu, 
  BarChart2, 
  Tag, 
  Rocket, 
  Search,
  Brain,
  Terminal,
  Layers,
  Zap,
  Shield,
  LineChart,
  FileCode,
  Globe
} from 'lucide-react';

export interface RoleConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  tools: string[]; // Tool IDs from tools.ts
  defaultProjectName: string;
  suggestedTasks: string[];
}

export const ROLES: RoleConfig[] = [
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Build predictive models, perform statistical analysis, and discover insights from complex datasets.',
    icon: Brain,
    color: 'from-blue-600 to-indigo-600',
    tools: ['python', 'r', 'jupyter', 'pandas', 'matplotlib', 'seaborn', 'scikit-learn'],
    defaultProjectName: 'Statistical Analysis Mission',
    suggestedTasks: [
      'Perform Exploratory Data Analysis (EDA)',
      'Clean and preprocess raw datasets',
      'Train baseline predictive models',
      'Optimize hyperparameters'
    ]
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Transform data into actionable insights through visualization, reporting, and dashboarding.',
    icon: BarChart2,
    color: 'from-emerald-600 to-teal-600',
    tools: ['sql', 'excel', 'tableau', 'powerbi', 'plotly', 'd3js'],
    defaultProjectName: 'Business Intelligence Report',
    suggestedTasks: [
      'Design interactive dashboards',
      'Extract insights from SQL databases',
      'Generate automated reports',
      'Identify key performance indicators'
    ]
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    description: 'Design, build, and deploy large-scale machine learning systems and neural networks.',
    icon: Cpu,
    color: 'from-purple-600 to-pink-600',
    tools: ['pytorch', 'tensorflow', 'keras', 'hugging-face', 'mlflow', 'docker'],
    defaultProjectName: 'Deep Learning Pipeline',
    suggestedTasks: [
      'Implement neural network architectures',
      'Manage model training pipelines',
      'Track experiments with MLflow',
      'Scale inference services'
    ]
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    description: 'Construct and maintain data pipelines, architectures, and robust data processing systems.',
    icon: Layers,
    color: 'from-orange-600 to-red-600',
    tools: ['airflow', 'spark', 'kafka', 'kubernetes', 'aws', 'azure'],
    defaultProjectName: 'ETL Pipeline Infrastructure',
    suggestedTasks: [
      'Build scalable ETL pipelines',
      'Optimize database schemas',
      'Configure cloud infrastructure',
      'Monitor data quality and integrity'
    ]
  },
  {
    id: 'labeling-specialist',
    title: 'Labeling Specialist',
    description: 'Create high-quality training data through precise annotation, classification, and quality assurance.',
    icon: Tag,
    color: 'from-orange-500 to-amber-600',
    tools: ['label-studio', 'prodigy', 'opencv'],
    defaultProjectName: 'Dataset Annotation Mission',
    suggestedTasks: [
      'Annotate images for computer vision',
      'Classify text for NLP models',
      'Perform QA on existing labels',
      'Create ground-truth datasets'
    ]
  }
];
