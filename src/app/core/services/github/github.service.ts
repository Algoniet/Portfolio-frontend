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
  // Icons from https://devicon.dev/ - v2.x
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
    'Spring Boot': 'devicon-spring-original colored',
    'Spring': 'devicon-spring-original colored',
    'Express': 'devicon-express-original',
    'Express.js': 'devicon-express-original',
    'Node.js': 'devicon-nodejs-plain colored',
    'Django': 'devicon-django-plain',
    'Flask': 'devicon-flask-original',
    'FastAPI': 'devicon-fastapi-plain',
    'NestJS': 'devicon-nestjs-plain colored',

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
    'Scala': 'devicon-scala-plain colored',

    // Styling
    'HTML': 'devicon-html5-plain colored',
    'HTML5': 'devicon-html5-plain colored',
    'CSS': 'devicon-css3-plain colored',
    'CSS3': 'devicon-css3-plain colored',
    'SCSS': 'devicon-sass-original colored',
    'Sass': 'devicon-sass-original colored',
    'Tailwind': 'devicon-tailwindcss-original colored',
    'Tailwindcss': 'devicon-tailwindcss-original colored',
    'TailwindCSS': 'devicon-tailwindcss-original colored',
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
    'AWS': 'devicon-amazonwebservices-original-wordmark colored',
    'Azure': 'devicon-azure-plain colored',
    'Google Cloud': 'devicon-googlecloud-plain colored',
    'GCP': 'devicon-googlecloud-plain colored',
    'Vercel': 'devicon-vercel-original colored',
    'Netlify': 'devicon-netlify-plain colored',
    'GitHub Actions': 'devicon-githubactions-plain colored',
    'Git': 'devicon-git-plain colored',

    // Tools
    'Webpack': 'devicon-webpack-plain colored',
    'Vite': 'devicon-vitejs-plain colored',
    'Jest': 'devicon-jest-plain colored',
    'Vitest': 'devicon-vitest-plain colored',
    'Storybook': 'devicon-storybook-plain colored',
    'Figma': 'devicon-figma-plain colored',

    // Mobile
    'Android': 'devicon-android-plain colored',
    'Flutter': 'devicon-flutter-plain colored',
    'React Native': 'devicon-react-original colored',
    'Dart': 'devicon-dart-plain colored',

    // Others
    'GraphQL': 'devicon-graphql-plain colored',
    'REST API': 'fa-solid fa-cloud-arrow-up',
    'API': 'fa-solid fa-cloud-arrow-up',
    'Shell': 'devicon-bash-plain',
    'Bash': 'devicon-bash-plain',
    'Jupyter': 'devicon-jupyter-plain colored',
    'Jupyter Notebook': 'devicon-jupyter-plain colored',
    'Markdown': 'devicon-markdown-original',
    'JSON': 'devicon-json-plain',
    'YAML': 'devicon-yaml-plain',
    'TOML': 'fa-solid fa-file-code',
  };

  // Keywords to detect technologies from repo names and descriptions
  private techKeywords: { [key: string]: string[] } = {
    'Angular': ['angular', 'ng-', 'ngx-', 'angularjs'],
    'React': ['react', 'reactjs', 'nextjs', 'next.js', 'react-native'],
    'Vue': ['vue', 'vuejs', 'nuxt', 'nuxtjs', 'nuxt.js'],
    'TypeScript': ['typescript', 'ts-', '.ts'],
    'Spring Boot': ['spring-boot', 'springboot', 'spring-boot-starter'],
    'Spring': ['spring-framework', 'springframework'],
    'Node.js': ['node', 'nodejs', 'express', 'expressjs', 'nestjs', 'nest.js', 'fastify'],
    'Django': ['django', 'django-rest'],
    'Flask': ['flask'],
    'FastAPI': ['fastapi'],
    'Docker': ['docker', 'dockerfile', 'container'],
    'Kubernetes': ['kubernetes', 'k8s'],
    'MongoDB': ['mongodb', 'mongo', 'mongoose'],
    'PostgreSQL': ['postgresql', 'postgres', 'pg-', 'psql'],
    'MySQL': ['mysql', 'mariadb'],
    'Redis': ['redis'],
    'Firebase': ['firebase'],
    'Supabase': ['supabase'],
    'Tailwind': ['tailwind', 'tailwindcss', 'tailwind-css'],
    'Bootstrap': ['bootstrap'],
    'GraphQL': ['graphql', 'gql', 'apollo'],
    'Python': ['python', 'python3', 'py-', '.py'],
    'Java': ['java', 'maven', 'gradle', 'spring'],
    'Kotlin': ['kotlin', 'kt-', 'android-kotlin'],
    'Rust': ['rust', 'cargo', 'rust-lang'],
    'Go': ['golang', 'go-', 'gin-'],
    'PHP': ['php', 'laravel', 'symfony'],
    'Ruby': ['ruby', 'rails', 'ruby-on-rails'],
    'Vite': ['vite'],
    'Webpack': ['webpack'],
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
   * Priority: 1) Language (primary), 2) Topics, 3) Detected from name/description
   */
  private extractTechnologies(repo: GitHubRepo): string[] {
    const technologies: Set<string> = new Set();

    // 1. Add main language first (highest priority)
    if (repo.language) {
      const langMap: { [key: string]: string } = {
        'Jupyter Notebook': 'Jupyter',
        'Shell': 'Shell',
      };
      const normalizedLang = langMap[repo.language] || repo.language;
      technologies.add(normalizedLang);
    }

    // 2. Add technologies from topics (GitHub topics are usually very accurate)
    if (repo.topics && repo.topics.length > 0) {
      repo.topics.forEach(topic => {
        const normalized = this.normalizeTechName(topic);
        // Solo agregar si tenemos un icono mapeado para esta tecnología
        if (this.technologyIconMap[normalized]) {
          technologies.add(normalized);
        }
      });
    }

    // 3. Detect additional technologies from repo name and description
    const searchText = `${repo.name} ${repo.description || ''}`.toLowerCase();

    for (const [tech, keywords] of Object.entries(this.techKeywords)) {
      // Solo agregar si aún no está en la lista y tenemos icono
      if (!technologies.has(tech) && this.technologyIconMap[tech]) {
        for (const keyword of keywords) {
          if (searchText.includes(keyword)) {
            technologies.add(tech);
            break;
          }
        }
      }
    }

    // 4. Special mappings for common patterns
    if (searchText.includes('api') && !technologies.has('REST API') && !technologies.has('GraphQL')) {
      technologies.add('REST API');
    }

    // Convert to array - limit to 8 to show more technologies including topics
    return Array.from(technologies).slice(0, 8);
  }

  /**
   * Normalizes technology name for icon lookup
   * Handles GitHub topics which are usually lowercase with hyphens
   */
  private normalizeTechName(name: string): string {
    if (!name) return '';

    const lower = name.toLowerCase();

    // Direct lowercase mappings for common GitHub topics
    const lowercaseMappings: { [key: string]: string } = {
      'nodejs': 'Node.js',
      'node': 'Node.js',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'mongo': 'MongoDB',
      'tailwindcss': 'Tailwind',
      'tailwind-css': 'Tailwind',
      'springboot': 'Spring Boot',
      'spring-boot': 'Spring Boot',
      'nextjs': 'Next.js',
      'next.js': 'Next.js',
      'nuxtjs': 'Nuxt.js',
      'nuxt.js': 'Nuxt.js',
      'vuejs': 'Vue',
      'vue.js': 'Vue',
      'reactjs': 'React',
      'react-native': 'React Native',
      'expressjs': 'Express',
      'nestjs': 'NestJS',
      'html5': 'HTML5',
      'css3': 'CSS3',
      'sass': 'Sass',
      'scss': 'SCSS',
      'aws': 'AWS',
      'gcp': 'GCP',
      'googlecloud': 'Google Cloud',
      'google-cloud': 'Google Cloud',
      'github-actions': 'GitHub Actions',
      'restapi': 'REST API',
      'rest-api': 'REST API',
      'graphql': 'GraphQL',
      'dockerfile': 'Docker',
      'shell': 'Shell',
      'bash': 'Bash',
      'jupyter-notebook': 'Jupyter',
      'fastapi': 'FastAPI',
      'vite': 'Vite',
      'kotlin': 'Kotlin',
      'flutter': 'Flutter',
      'android': 'Android',
      'ios': 'iOS',
      'swift': 'Swift',
      'dart': 'Dart',
      'go': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'laravel': 'Laravel',
      'symfony': 'Symfony',
      'ruby': 'Ruby',
      'rails': 'Ruby',
      'django': 'Django',
      'flask': 'Flask',
      'redis': 'Redis',
      'firebase': 'Firebase',
      'supabase': 'Supabase',
      'git': 'Git',
      'github': 'GitHub Actions',
      'gitlab': 'Git',
      'vercel': 'Vercel',
      'netlify': 'Netlify',
      'heroku': 'Heroku',
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'terraform': 'Terraform',
      'ansible': 'Ansible',
      'jenkins': 'Jenkins',
      'travis': 'CI/CD',
      'circleci': 'CI/CD',
    };

    if (lowercaseMappings[lower]) {
      return lowercaseMappings[lower];
    }

    // Default normalization: capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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