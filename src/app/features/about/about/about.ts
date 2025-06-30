import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  frontendTechnologies = [
    { name: 'Angular', icon: 'devicon-angularjs-plain colored' },
    { name: 'HTML5', icon: 'devicon-html5-plain colored' },
    { name: 'CSS3', icon: 'devicon-css3-plain colored' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
    { name: 'React', icon: 'devicon-react-plain colored' },
  ];
  backendTechnologies = [
    { name: 'Java', icon: 'devicon-java-plain colored' },
    { name: 'Spring Boot', icon: 'devicon-spring-plain colored' },
    { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
    { name: 'Express.js', icon: 'devicon-express-original colored' },
    { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
    { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
  ];
  skills: string[] = [
    'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'SCSS',
    'RxJS', 'NgRx', 'RESTful APIs', 'Git', 'Node.js (Básico)', 'SQL (Básico)',
    'Responsive Design', 'UX/UI Principles', 'Problem Solving', 'Teamwork',
    'Communication', 'Adaptability'
  ];

  experience: { title: string, company: string, years: string, description: string[] }[] = [
    {
      title: 'Desarrollador Front-end Senior',
      company: 'Tech Solutions Inc.',
      years: '2022 - Actualidad',
      description: [
        'Liderazgo en el desarrollo de interfaces de usuario para aplicaciones web escalables.',
        'Implementación de nuevas funcionalidades utilizando Angular y TypeScript.',
        'Optimización del rendimiento de la aplicación y mejora de la experiencia de usuario.'
      ]
    },
      {
      title: 'Desarrollador Front-end Senior',
      company: 'Tech Solutions Inc.',
      years: '2022 - Actualidad',
      description: [
        'Liderazgo en el desarrollo de interfaces de usuario para aplicaciones web escalables.',
        'Implementación de nuevas funcionalidades utilizando Angular y TypeScript.',
        'Optimización del rendimiento de la aplicación y mejora de la experiencia de usuario.'
      ]
    },
      {
      title: 'Desarrollador Front-end Senior',
      company: 'Tech Solutions Inc.',
      years: '2022 - Actualidad',
      description: [
        'Liderazgo en el desarrollo de interfaces de usuario para aplicaciones web escalables.',
        'Implementación de nuevas funcionalidades utilizando Angular y TypeScript.',
        'Optimización del rendimiento de la aplicación y mejora de la experiencia de usuario.'
      ]
    },
    {
      title: 'Desarrollador Web Junior',
      company: 'Creative Studio',
      years: '2020 - 2022',
      description: [
        'Desarrollo de sitios web responsivos y mantenimiento de plataformas existentes.',
        'Colaboración con el equipo de diseño para asegurar la fidelidad del prototipo.',
        'Aprendizaje continuo y aplicación de nuevas tecnologías web.'
      ]
    }
  ];

  education: { degree: string, institution: string, years: string }[] = [
    {
      degree: 'Grado en Ingeniería Informática',
      institution: 'Universidad Politécnica de Valencia',
      years: '2016 - 2020'
    },
    {
      degree: 'Máster en Desarrollo Web Full Stack',
      institution: 'Bootcamp Code Master',
      years: '2020'
    }
  ];
}
