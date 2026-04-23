import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Observable, from } from 'rxjs';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // Configuración de EmailJS - Reemplaza estos valores con los tuyos
  // Regístrate gratis en: https://www.emailjs.com/
  private readonly SERVICE_ID = 'service_5yuk8kv'; // Ej: 'service_abc123'
  private readonly TEMPLATE_ID = 'template_j72iy7m'; // Ej: 'template_xyz456'
  private readonly PUBLIC_KEY = 'Uu9o-rmPdlJFVbzSy'; // Ej: 'AbC123XyZ789'

  constructor() {}

  /**
   * Envía los datos del formulario de contacto usando EmailJS.
   * No requiere backend propio.
   * @param formData Objeto con los datos del formulario (nombre, email, mensaje).
   * @returns Un Observable que representa la respuesta de EmailJS.
   */
  sendContactForm(formData: ContactForm): Observable<any> {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_name: 'Portfolio Owner', // Personaliza con tu nombre
    };

    return from(
      emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams,
        this.PUBLIC_KEY
      )
    );
  }

  /**
   * Verifica si EmailJS está configurado correctamente.
   * @returns true si las credenciales están configuradas.
   */
  isConfigured(): boolean {
    return (
      this.SERVICE_ID !== 'service_5yuk8kv' &&
      this.TEMPLATE_ID !== 'template_j72iy7m' &&
      this.PUBLIC_KEY !== 'Uu9o-rmPdlJFVbzSy'
    );
  }
}
