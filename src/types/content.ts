export interface DocFrontmatter {
  title: string;
  slug: string;
  shortTitle: string;
  description: string;
  category: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scalingType: 'horizontal' | 'vertical' | 'cluster' | 'event-driven';
  keywords: string[];
}

export interface NavItem {
  slug: string;
  title: string;
  shortTitle: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
