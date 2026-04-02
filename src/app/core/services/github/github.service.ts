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

  // Mapping of technologies to their devicon classes
  private technologyIconMap: { [key: string]: string } = {
    // Frontend Frameworks
    'Angular': 'devicon-angularjs-plain colored',
    'React': 'devicon-react-original colored',
    'Vue': 'devicon-vuejs-plain colored',
    'Vue.js': 'devicon-vuejs-plain colored',
    'Svelte': 'devicon-svelte-plain colored',
    'Next.js': 'devicon-nextjs-plain',
    'Nuxt.js': 'devicon-nuxtjs-plain colored',

    // Backend Frameworks
    'Spring Boot': 'devicon-spring-plain colored',
    'Spring': 'devicon-spring-plain colored',
    'Express': 'devicon-express-original',
    'Express.js': 'devicon-express-original',
    'Node.js': 'devicon-nodejs-plain colored',
    'Django': 'devicon-django-plain',
    'Flask': 'devicon-flask-original',
    'FastAPI': 'devicon-fastapi-plain',
    'NestJS': 'devicon-nestjs-plain',

    // Languages
    'TypeScript': 'devicon-typescript-plain colored',
    'JavaScript': 'devicon-javascript-plain colored',
    'Python': 'devicon-python-plain colored',
    'Java': 'devicon-java-plain colored',
    'C#': 'devicon-csharp-plain colored',
    'C++': 'devicon-cplusplus-plain colored',
    'C': 'devicon-c-plain',
    'Go': 'devicon-go-plain colored',
    'Rust': 'devicon-rust-plain',
    'PHP': 'devicon-php-plain colored',
    'Ruby': 'devicon-ruby-plain colored',
    'Kotlin': 'devicon-kotlin-plain colored',
    'Swift': 'devicon-swift-plain colored',
    'Scala': 'devicon-scala-plain colored',

    // Styling
    'HTML': 'devicon-html5-plain colored',
    'HTML5': 'devicon-html5-plain colored',
    'CSS': 'devicon-css3-plain colored',
    'CSS3': 'devicon-css3-plain colored',
    'SCSS': 'devicon-sass-original colored',
    'Sass': 'devicon-sass-original colored',
    'Tailwind': 'devicon-tailwindcss-plain colored',
    'Tailwindcss': 'devicon-tailwindcss-plain colored',
    'Bootstrap': 'devicon-bootstrap-plain colored',

    // Databases
    'SQL': 'fa-solid fa-database',
    'MySQL': 'devicon-mysql-plain colored',
    'PostgreSQL': 'devicon-postgresql-plain colored',
    'Postgres': 'devicon-postgresql-plain colored',
    'MongoDB': 'devicon-mongodb-plain colored',
    'Redis': 'devicon-redis-plain colored',
    'SQLite': 'devicon-sqlite-plain colored',
    'Firebase': 'devicon-firebase-plain colored',
    'Supabase': 'devicon-supabase-plain colored',

    // DevOps & Cloud
    'Docker': 'devicon-docker-plain colored',
    'Kubernetes': 'devicon-kubernetes-plain colored',
    'AWS': 'devicon-amazonwebservices-plain-wordmark colored',
    'Azure': 'devicon-azure-plain colored',
    'Google Cloud': 'devicon-googlecloud-plain colored',
    'GCP': 'devicon-googlecloud-plain colored',
    'Vercel': 'devicon-vercel-plain colored',
    'Netlify': 'devicon-netlify-plain colored',
    'GitHub Actions': 'devicon-githubactions-plain colored',
    'Git': 'devicon-git-plain colored',

    // Tools
    'Webpack': 'devicon-webpack-plain colored',
    'Vite': 'devicon-vite-plain colored',
    'Jest': 'devicon-jest-plain colored',
    'Vitest': 'devicon-vitest-plain colored',
    'Storybook': 'devicon-storybook-plain colored',
    'Figma': 'devicon-figma-plain colored',

    // Mobile
    'Android': 'devicon-android-plain colored',
    'Flutter': 'devicon-flutter-plain colored',
    'React Native': 'devicon-react-original colored',

    // Others
    'GraphQL': 'devicon-graphql-plain colored',
    'REST API': 'fa-solid fa-cloud-arrow-up',
    'API': 'fa-solid fa-cloud-arrow-up',
    'Shell': 'devicon-bash-plain',
    'Bash': 'devicon-bash-plain',
    'Jupyter': 'devicon-jupyter-plain colored',
    'Jupyter Notebook': 'devicon-jupyter-plain colored',
    'Markdown': 'devicon-markdown-plain',
  };

  // Keywords to detect technologies from repo names and descriptions
  private techKeywords: { [key: string]: string[] } = {
    'Angular': ['angular', 'ng-', 'ngx-'],
    'React': ['react', 'reactjs', 'nextjs', 'next.js'],
    'Vue': ['vue', 'vuejs', 'nuxt', 'nuxtjs'],
    'TypeScript': ['typescript', 'ts-'],
    'Spring Boot': ['spring-boot', 'springboot', 'spring-boot-starter'],
    'Spring': ['spring'],
    'Node.js': ['node', 'nodejs', 'express', 'nestjs', 'nest.js'],
    'Docker': ['docker', 'container'],
    'MongoDB': ['mongodb', 'mongo'],
    'PostgreSQL': ['postgresql', 'postgres', 'pg-'],
    'Firebase': ['firebase'],
    'Tailwind': ['tailwind', 'tailwindcss'],
    'GraphQL': ['graphql', 'gql', 'apollo'],
    'Python': ['python', 'django', 'flask', 'fastapi'],
    'Java': ['java', 'maven', 'gradle'],
    'Kotlin': ['kotlin', 'kt-'],
    'Rust': ['rust', 'cargo'],
    'Go': ['golang', 'go-'],
  };

  // Fallback projects when GitHub API fails
  private fallbackProjects: Project[] = [
    {
      title: 'Portfolio',
      description: 'Desarrollo completo de este mismo portfolio en el que muestro información sobre mi aprovechando mis conocimientos de frontend',
      imageUrl: 'assets/images/portfolio2.png',
      technologies: ['Angular', 'TypeScript', 'HTML5', 'SCSS', 'Git'],
      liveDemoUrl: 'https://algoniet.github.io/portfolio',
      githubUrl: 'https://github.com/Algoniet/portfolio'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Fetches ALL repositories from GitHub API with caching
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
   * Gets fallback projects with technology icons mapped
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
      imageUrl: this.getRepoImageUrl(repo),
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
   * Gets repository image URL (GitHub Open Graph image)
   */
  private getRepoImageUrl(repo: GitHubRepo): string {
    return `https://opengraph.githubassets.com/1/Algoniet/${repo.name}`;
  }

  /**
   * Extracts technologies from repo language, topics, name and description
   */
  private extractTechnologies(repo: GitHubRepo): string[] {
    const technologies: Set<string> = new Set();

    // 1. Add main language
    if (repo.language) {
      // Map GitHub language names to our standard names
      const langMap: { [key: string]: string } = {
        'Jupyter Notebook': 'Jupyter',
        'Shell': 'Shell',
      };
      const normalizedLang = langMap[repo.language] || repo.language;
      technologies.add(normalizedLang);
    }

    // 2. Add technologies from topics
    repo.topics?.forEach(topic => {
      const normalized = this.normalizeTechName(topic);
      if (this.technologyIconMap[normalized]) {
        technologies.add(normalized);
      }
    });

    // 3. Detect technologies from repo name and description
    const searchText = `${repo.name} ${repo.description || ''}`.toLowerCase();

    for (const [tech, keywords] of Object.entries(this.techKeywords)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          technologies.add(tech);
          break;
        }
      }
    }

    // 4. Special mappings for common patterns
    if (searchText.includes('api') && !technologies.has('REST API')) {
      // Only add REST API if no GraphQL
      if (!technologies.has('GraphQL')) {
        technologies.add('REST API');
      }
    }

    // Convert to array and limit to reasonable number (max 6)
    return Array.from(technologies).slice(0, 6);
  }

  /**
   * Normalizes technology name for icon lookup
   */
  private normalizeTechName(name: string): string {
    const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    // Handle special cases
    const specialMappings: { [key: string]: string } = {
      'Nodejs': 'Node.js',
      'Typescript': 'TypeScript',
      'Javascript': 'JavaScript',
      'Postgres': 'PostgreSQL',
      'Mongodb': 'MongoDB',
      'Tailwindcss': 'Tailwind',
      'Springboot': 'Spring Boot',
      'Nextjs': 'Next.js',
      'Nuxtjs': 'Nuxt.js',
    };

    return specialMappings[normalized] || normalized;
  }

  /**
   * Maps technology names to icon classes
   */
  private mapTechnologiesToIcons(technologies: string[]): { name: string; icon: string }[] {
    return technologies.map(tech => ({
      name: tech,
      icon: this.technologyIconMap[tech] || 'fa-solid fa-code'
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