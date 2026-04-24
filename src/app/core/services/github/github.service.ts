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
  private readonly CACHE_DURATION_MS = 60 * 60 * 1000;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private readonly ICON_MAP: Record<string, string> = {
    // ── Languages ────────────────────────────────────────────────────
    'TypeScript':   'devicon-typescript-plain colored',
    'JavaScript':   'devicon-javascript-plain colored',
    'Python':       'devicon-python-plain colored',
    'Java':         'devicon-java-plain colored',
    'C#':           'devicon-csharp-plain colored',
    'C++':          'devicon-cplusplus-plain colored',
    'C':            'devicon-c-plain colored',
    'Go':           'devicon-go-original-wordmark colored',
    'Rust':         'devicon-rust-plain',
    'PHP':          'devicon-php-plain colored',
    'Ruby':         'devicon-ruby-plain colored',
    'Kotlin':       'devicon-kotlin-plain colored',
    'Swift':        'devicon-swift-plain colored',
    'Dart':         'devicon-dart-plain colored',
    'Scala':        'devicon-scala-plain colored',

    // ── Frontend ─────────────────────────────────────────────────────
    'Angular':      'devicon-angularjs-plain colored',
    'React':        'devicon-react-original colored',
    'Vue':          'devicon-vuejs-plain colored',
    'Vue.js':       'devicon-vuejs-plain colored',
    'Svelte':       'devicon-svelte-plain colored',
    'Next.js':      'devicon-nextjs-plain',
    'Nuxt.js':      'devicon-nuxtjs-plain colored',
    'HTML':         'devicon-html5-plain colored',
    'HTML5':        'devicon-html5-plain colored',
    'CSS':          'devicon-css3-plain colored',
    'CSS3':         'devicon-css3-plain colored',
    'SCSS':         'devicon-sass-original colored',
    'Sass':         'devicon-sass-original colored',

    // ── Styling ───────────────────────────────────────────────────────
    'Tailwind':     'devicon-tailwindcss-original colored',
    'TailwindCSS':  'devicon-tailwindcss-original colored',
    'Bootstrap':    'devicon-bootstrap-plain colored',

    // ── Backend ───────────────────────────────────────────────────────
    'Spring Boot':  'devicon-spring-original colored',
    'Spring':       'devicon-spring-original colored',
    'Express':      'devicon-express-original',
    'Node.js':      'devicon-nodejs-plain colored',
    'Django':       'devicon-django-plain',
    'Flask':        'devicon-flask-original',
    'FastAPI':      'devicon-fastapi-plain',
    'NestJS':       'devicon-nestjs-plain colored',
    'Hibernate':    'devicon-hibernate-plain colored',
    'Thymeleaf':    'devicon-thymeleaf-plain colored',

    // ── Build & Persistence ───────────────────────────────────────────
    'Maven':        'devicon-maven-plain colored',
    'Gradle':       'devicon-gradle-plain colored',
    'JPA':          'fa-solid fa-database',
    'REST API':     'fa-solid fa-plug',
    'GraphQL':      'devicon-graphql-plain colored',

    // ── Testing ───────────────────────────────────────────────────────
    'JUnit':        'fa-solid fa-vial-circle-check',
    'Jest':         'devicon-jest-plain colored',
    'Cypress':      'devicon-cypressio-plain colored',

    // ── Databases ─────────────────────────────────────────────────────
    'MySQL':        'devicon-mysql-plain colored',
    'PostgreSQL':   'devicon-postgresql-plain colored',
    'MongoDB':      'devicon-mongodb-plain colored',
    'Redis':        'devicon-redis-plain colored',
    'SQLite':       'devicon-sqlite-plain colored',
    'Firebase':     'devicon-firebase-plain colored',
    'Oracle':       'devicon-oracle-original colored',

    // ── DevOps & Tools ────────────────────────────────────────────────
    'Docker':           'devicon-docker-plain colored',
    'Kubernetes':       'devicon-kubernetes-plain colored',
    'AWS':              'devicon-amazonwebservices-original-wordmark colored',
    'Azure':            'devicon-azure-plain colored',
    'Google Cloud':     'devicon-googlecloud-plain colored',
    'Vercel':           'devicon-vercel-original colored',
    'Git':              'devicon-git-plain colored',
    'GitHub Actions':   'devicon-githubactions-plain colored',
    'Webpack':          'devicon-webpack-plain colored',
    'Vite':             'devicon-vitejs-plain colored',
    'SVN':              'fa-solid fa-code-branch',
    'Swagger':          'fa-solid fa-file-code',
    'Postman':          'devicon-postman-plain colored',
    'Linux':            'devicon-linux-plain',
    'Nginx':            'devicon-nginx-original colored',

    // ── Mobile ────────────────────────────────────────────────────────
    'Android':      'devicon-android-plain colored',
    'Flutter':      'devicon-flutter-plain colored',

    // ── Other ─────────────────────────────────────────────────────────
    'Shell':            'devicon-bash-plain',
    'Bash':             'devicon-bash-plain',
    'Microservices':    'fa-solid fa-cubes',
    'AEM':              'fa-solid fa-layer-group',
  };

  private fallbackProjects: Project[] = [
    {
      title: 'Portfolio',
      description: 'Desarrollo completo de este mismo portfolio en el que muestro información sobre mi aprovechando mis conocimientos de frontend',
      imageUrl: 'assets/images/portfolio2.png',
      technologies: ['Angular', 'TypeScript', 'HTML5', 'SCSS', 'Git'],
      liveDemoUrl: 'https://algoniet.github.io/portfolio',
      githubUrl: 'https://github.com/Algoniet/portfolio',
      technologyIcons: [
        { name: 'Angular',     icon: 'devicon-angularjs-plain colored' },
        { name: 'TypeScript',  icon: 'devicon-typescript-plain colored' },
        { name: 'HTML5',       icon: 'devicon-html5-plain colored' },
        { name: 'SCSS',        icon: 'devicon-sass-original colored' },
        { name: 'Git',         icon: 'devicon-git-plain colored' }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

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

  getFallbackProjects(): Project[] {
    return this.fallbackProjects.map(project => ({
      ...project,
      technologyIcons: this.mapTechnologiesToIcons(project.technologies)
    }));
  }

  private mapReposToProjects(repos: GitHubRepo[]): Project[] {
    const filteredRepos = repos.filter(repo => !repo.fork);
    if (filteredRepos.length === 0) return this.getFallbackProjects();

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

  private formatRepoName(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private extractTechnologies(repo: GitHubRepo): string[] {
    const technologies: string[] = [];

    if (repo.language && !technologies.includes(repo.language)) {
      technologies.push(repo.language);
    }

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
   * Normalizes GitHub topic strings (lowercase, hyphens) to display names.
   * Handles all common spelling variants for the same technology.
   */
  private normalizeTopic(topic: string): string {
    // Collapse hyphens, underscores and spaces so "spring-boot",
    // "spring_boot" and "springboot" all hit the same key.
    const flat = topic.toLowerCase().replace(/[-_ ]+/g, '');

    const flatMap: Record<string, string> = {
      // ── Languages ────────────────────────────────────────────────
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python':     'Python',
      'java':       'Java',
      'csharp':     'C#',
      'dotnet':     'C#',
      'cpp':        'C++',
      'cplusplus':  'C++',
      'go':         'Go',
      'golang':     'Go',
      'rust':       'Rust',
      'php':        'PHP',
      'ruby':       'Ruby',
      'kotlin':     'Kotlin',
      'swift':      'Swift',
      'dart':       'Dart',
      'scala':      'Scala',

      // ── Frontend ─────────────────────────────────────────────────
      'angular':    'Angular',
      'react':      'React',
      'reactjs':    'React',
      'vue':        'Vue',
      'vuejs':      'Vue',
      'svelte':     'Svelte',
      'next':       'Next.js',
      'nextjs':     'Next.js',
      'nuxt':       'Nuxt.js',
      'nuxtjs':     'Nuxt.js',
      'html':       'HTML',
      'html5':      'HTML5',
      'css':        'CSS',
      'css3':       'CSS3',
      'scss':       'SCSS',
      'sass':       'Sass',

      // ── Styling ───────────────────────────────────────────────────
      'tailwind':    'Tailwind',
      'tailwindcss': 'Tailwind',
      'bootstrap':   'Bootstrap',

      // ── Backend (all variants collapse to same key) ────────────────
      'spring':           'Spring',
      'springframework':  'Spring',
      'springboot':       'Spring Boot',   // springboot / spring-boot / spring_boot
      'springbootapp':    'Spring Boot',
      'nestjs':           'NestJS',
      'express':          'Express',
      'expressjs':        'Express',
      'nodejs':           'Node.js',
      'node':             'Node.js',
      'django':           'Django',
      'flask':            'Flask',
      'fastapi':          'FastAPI',
      'hibernate':        'Hibernate',
      'thymeleaf':        'Thymeleaf',

      // ── REST / API ────────────────────────────────────────────────
      'restapi':   'REST API',   // rest-api / restapi / rest_api
      'apirest':   'REST API',   // api-rest / apirest / api_rest
      'restful':   'REST API',
      'rest':      'REST API',

      // ── Build & Persistence ───────────────────────────────────────
      'maven':   'Maven',
      'gradle':  'Gradle',
      'jpa':     'JPA',
      'graphql': 'GraphQL',

      // ── Testing ───────────────────────────────────────────────────
      'junit':    'JUnit',
      'junit5':   'JUnit',
      'jest':     'Jest',
      'cypress':  'Cypress',

      // ── Databases ─────────────────────────────────────────────────
      'mysql':      'MySQL',
      'postgresql': 'PostgreSQL',
      'postgres':   'PostgreSQL',
      'mongodb':    'MongoDB',
      'mongo':      'MongoDB',
      'redis':      'Redis',
      'sqlite':     'SQLite',
      'firebase':   'Firebase',
      'oracle':     'Oracle',

      // ── DevOps & Tools ────────────────────────────────────────────
      'docker':         'Docker',
      'kubernetes':     'Kubernetes',
      'k8s':            'Kubernetes',
      'aws':            'AWS',
      'amazonwebservices': 'AWS',
      'azure':          'Azure',
      'gcp':            'Google Cloud',
      'googlecloud':    'Google Cloud',
      'vercel':         'Vercel',
      'git':            'Git',
      'github':         'Git',
      'githubactions':  'GitHub Actions',
      'webpack':        'Webpack',
      'vite':           'Vite',
      'svn':            'SVN',
      'subversion':     'SVN',
      'swagger':        'Swagger',
      'openapi':        'Swagger',
      'postman':        'Postman',
      'linux':          'Linux',
      'nginx':          'Nginx',

      // ── Mobile ────────────────────────────────────────────────────
      'android': 'Android',
      'flutter': 'Flutter',

      // ── Other ─────────────────────────────────────────────────────
      'shell':          'Shell',
      'bash':           'Bash',
      'microservices':  'Microservices',
      'microservice':   'Microservices',
      'aem':            'AEM',
      'adobeexperiencemanager': 'AEM',
    };

    if (flatMap[flat]) return flatMap[flat];

    // Fallback: try the original lowercase key (hyphens preserved)
    const lower = topic.toLowerCase();
    const hyphenMap: Record<string, string> = {
      'c':         'C',
      'c-sharp':   'C#',
      'c-plus-plus': 'C++',
      'rest-api':  'REST API',
      'api-rest':  'REST API',
    };
    if (hyphenMap[lower]) return hyphenMap[lower];

    // Last resort: capitalise first letter
    return topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
  }

  private mapTechnologiesToIcons(technologies: string[]): { name: string; icon: string }[] {
    return technologies.map(tech => ({
      name: tech,
      icon: this.ICON_MAP[tech] ?? 'fa-solid fa-code'
    }));
  }

  private saveToCache(repos: GitHubRepo[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({ repos, timestamp: Date.now() }));
    } catch (e) {
      console.warn('Failed to save to cache:', e);
    }
  }

  private getFromCache(): GitHubRepo[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      const { repos, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < this.CACHE_DURATION_MS) return repos;
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch {
      return null;
    }
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}
