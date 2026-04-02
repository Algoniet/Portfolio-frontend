// src/app/core/models/project.model.ts

export interface TechnologyIcon {
  name: string;
  icon: string;
}

export interface Project {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  technologyIcons?: TechnologyIcon[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
}