// src/app/core/services/github/github.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Project, GitHubRepo } from '../../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly API_URL = 'https://api.github.com/users/Algoniet/repos';
  private readonly CACHE_KEY = 'github_repos_cache';
  private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Simplified icon mapping - only common technologies
  private readonly ICON_MAP: Record<string, string> = {
    // Languages
    'TypeScript': 'devicon-typescript-plain colored',
    'JavaScript': 'devicon-javascript-plain colored',
    'Python': 'devicon-python-plain colored',
    'Java': 'devicon-java-plain colored',
    'C#': 'devicon-csharp-plain colored',
    'C++': 'devicon-cplusplus-plain colored',
    'C': 'devicon-c-plain colored',
    'Go': 'devicon-go-original-wordmark colored',
    'Rust': 'devicon-rust-plain',
    'PHP': 'devicon-php-plain colored',
    'Ruby': 'devicon-ruby-plain colored',
    'Kotlin': 'devicon-kotlin-plain colored',
    'Swift': 'devicon-swift-plain colored',
    'Dart': 'devicon-dart-plain colored',
    'Scala': 'devicon-scala-plain colored',

    // Frontend
    'Angular': 'devicon-angularjs-plain colored',
    'React': 'devicon-react-original colored',
    'Vue': 'devicon-vuejs-plain colored',
    'Vue.js': 'devicon-vuejs-plain colored',
    'Svelte': 'devicon-svelte-plain colored',
    'Next.js': 'devicon-nextjs-plain',
    'Nuxt.js': 'devicon-nuxtjs-plain colored',
    'HTML': 'devicon-html5-plain colored',
    'HTML5': 'devicon-html5-plain colored',
    'CSS': 'devicon-css3-plain colored',
    'CSS3': 'devicon-css3-plain colored',
    'SCSS': 'devicon-sass-original colored',
    'Sass': 'devicon-sass-original colored',

    // Styling
    'Tailwind': 'devicon-tailwindcss-original colored',
    'TailwindCSS': 'devicon-tailwindcss-original colored',
    'Bootstrap': 'devicon-bootstrap-plain colored',

    // Backend
    'Spring Boot': 'devicon-spring-original colored',
    'Spring': 'devicon-spring-original colored',
    'Express': 'devicon-express-original',
    'Node.js': 'devicon-nodejs-plain colored',
    'Django': 'devicon-django-plain',
    'Flask': 'devicon-flask-original',
    'FastAPI': 'devicon-fastapi-plain',
    'NestJS': 'devicon-nestjs-plain colored',

    // Databases
    'MySQL': 'devicon-mysql-plain colored',
    'PostgreSQL': 'devicon-postgresql-plain colored',
    'Postgres': 'devicon-postgresql-plain colored',
    'MongoDB': 'devicon-mongodb-plain colored',
    'Redis': 'devicon-redis-plain colored',
    'SQLite': 'devicon-sqlite-plain colored',
    'Firebase': 'devicon-firebase-plain colored',

    // DevOps & Tools
    'Docker': 'devicon-docker-plain colored',
    'Kubernetes': 'devicon-kubernetes-plain colored',
    'AWS': 'devicon-amazonwebservices-original-wordmark colored',
    'Azure': 'devicon-azure-plain colored',
    'Google Cloud': 'devicon-googlecloud-plain colored',
    'Vercel': 'devicon-vercel-original colored',
    'Git': 'devicon-git-plain colored',
    'GitHub Actions': 'devicon-githubactions-plain colored',
    'Webpack': 'devicon-webpack-plain colored',
    'Vite': 'devicon-vitejs-plain colored',

    // Mobile
    'Android': 'devicon-android-plain colored',
    'Flutter': 'devicon-flutter-plain colored',

    // Others
    'GraphQL': 'devicon-graphql-plain colored',
    'Shell': 'devicon-bash-plain',
    'Bash': 'devicon-bash-plain',
  };

  // Fallback projects when GitHub API fails
  private fallbackProjects: Project[] = [
    {
      title: 'Portfolio',
      description: 'Desarrollo completo de este mismo portfolio en el que muestro información sobre mi aprovechando mis conocimientos de frontend',
      imageUrl: 'assets/images/portfolio2.png',
      technologies: ['Angular', 'TypeScript', 'HTML5', 'SCSS', 'Git'],
      liveDemoUrl: 'https://algoniet.github.io/portfolio',
      githubUrl: 'https://github.com/Algoniet/portfolio',
      technologyIcons: [
        { name: 'Angular', icon: 'devicon-angularjs-plain colored' },
        { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
        { name: 'HTML5', icon: 'devicon-html5-plain colored' },
        { name: 'SCSS', icon: 'devicon-sass-original colored' },
        { name: 'Git', icon: 'devicon-git-plain colored' }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Fetches repositories from GitHub API with caching
   */
  getProjects(): Observable<Project[]> {
    const cached = this.getFromCache();
    if (cached) {
      return of(this.mapReposToProjects(cached));
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const params = new HttpParams()
      .set('per_page', '100')
      .set('sort', 'pushed')
      .set('direction', 'desc');

    return this.http.get<GitHubRepo[]>(this.API_URL, { params }).pipe(
      tap(repos => {
        this.saveToCache(repos);
        this.loadingSubject.next(false);
      }),
      map(repos => this.mapReposToProjects(repos)),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('No se pudieron cargar los proyectos desde GitHub. Mostrando proyectos locales.');
        console.error('GitHub API error:', error);
        return of(this.getFallbackProjects());
      })
    );
  }

  /**
   * Gets fallback projects
   */
  getFallbackProjects(): Project[] {
    return this.fallbackProjects.map(project => ({
      ...project,
      technologyIcons: this.mapTechnologiesToIcons(project.technologies)
    }));
  }

  /**
   * Maps GitHub repos to Project interface
   */
  private mapReposToProjects(repos: GitHubRepo[]): Project[] {
    const filteredRepos = repos.filter(repo => !repo.fork);

    if (filteredRepos.length === 0) {
      return this.getFallbackProjects();
    }

    return filteredRepos.map(repo => ({
      id: repo.id,
      title: this.formatRepoName(repo.name),
      description: repo.description || 'Proyecto sin descripción',
      imageUrl: `https://opengraph.githubassets.com/1/Algoniet/${repo.name}`,
      technologies: this.extractTechnologies(repo),
      liveDemoUrl: repo.homepage || undefined,
      githubUrl: repo.html_url,
      technologyIcons: this.mapTechnologiesToIcons(this.extractTechnologies(repo)),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      lastUpdated: repo.pushed_at
    }));
  }

  /**
   * Formats repository name to title case
   */
  private formatRepoName(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Extracts technologies from repo language and topics
   * Shows ALL topics configured in GitHub
   */
  private extractTechnologies(repo: GitHubRepo): string[] {
    const technologies: string[] = [];

    // Add main language first
    if (repo.language && !technologies.includes(repo.language)) {
      technologies.push(repo.language);
    }

    // Add ALL topics from GitHub (these are configured in the repo)
    if (repo.topics?.length) {
      repo.topics.forEach(topic => {
        const normalized = this.normalizeTopic(topic);
        if (!technologies.includes(normalized)) {
          technologies.push(normalized);
        }
      });
    }

    return technologies;
  }

  /**
   * Normalizes topic names from GitHub (usually lowercase with hyphens)
   */
  private normalizeTopic(topic: string): string {
    const normalizations: Record<string, string> = {
      // Languages
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'csharp': 'C#',
      'dotnet': 'C#',
      'cpp': 'C++',
      'cplusplus': 'C++',
      'c': 'C',
      'go': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'kotlin': 'Kotlin',
      'swift': 'Swift',
      'dart': 'Dart',
      'scala': 'Scala',

      // Frontend
      'angular': 'Angular',
      'react': 'React',
      'reactjs': 'React',
      'vue': 'Vue',
      'vuejs': 'Vue',
      'svelte': 'Svelte',
      'next': 'Next.js',
      'nextjs': 'Next.js',
      'nuxt': 'Nuxt.js',
      'nuxtjs': 'Nuxt.js',
      'html': 'HTML',
      'html5': 'HTML5',
      'css': 'CSS',
      'css3': 'CSS3',
      'scss': 'SCSS',
      'sass': 'Sass',

      // Styling
      'tailwind': 'Tailwind',
      'tailwindcss': 'Tailwind',
      'bootstrap': 'Bootstrap',

      // Backend
      'spring': 'Spring',
      'springboot': 'Spring Boot',
      'spring-framework': 'Spring',
      'express': 'Express',
      'expressjs': 'Express',
      'nodejs': 'Node.js',
      'node': 'Node.js',
      'django': 'Django',
      'flask': 'Flask',
      'fastapi': 'FastAPI',
      'nestjs': 'NestJS',

      // Databases
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'mongo': 'MongoDB',
      'redis': 'Redis',
      'sqlite': 'SQLite',
      'firebase': 'Firebase',

      // DevOps & Tools
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'aws': 'AWS',
      'amazon-web-services': 'AWS',
      'azure': 'Azure',
      'gcp': 'Google Cloud',
      'googlecloud': 'Google Cloud',
      'google-cloud': 'Google Cloud',
      'vercel': 'Vercel',
      'git': 'Git',
      'github': 'Git',
      'github-actions': 'GitHub Actions',
      'webpack': 'Webpack',
      'vite': 'Vite',

      // Mobile
      'android': 'Android',
      'flutter': 'Flutter',

      // Others
      'graphql': 'GraphQL',
      'shell': 'Shell',
      'bash': 'Bash',
    };

    const lower = topic.toLowerCase();
    return normalizations[lower] || topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
  }

  /**
   * Maps technology names to icon classes
   * Returns a generic icon if no specific mapping exists
   */
  private mapTechnologiesToIcons(technologies: string[]): { name: string; icon: string }[] {
    return technologies.map(tech => ({
      name: tech,
      icon: this.ICON_MAP[tech] || 'fa-solid fa-code'
    }));
  }

  /**
   * Saves repos to localStorage cache
   */
  private saveToCache(repos: GitHubRepo[]): void {
    try {
      const cacheData = { repos, timestamp: Date.now() };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to save to cache:', e);
    }
  }

  /**
   * Gets repos from localStorage cache if valid
   */
  private getFromCache(): GitHubRepo[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { repos, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < this.CACHE_DURATION_MS) {
        return repos;
      }

      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clears the cache manually
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}