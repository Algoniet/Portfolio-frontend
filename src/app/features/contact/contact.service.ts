import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

   private apiUrl = 'http://localhost:8080/portfolio/contact'; 

  constructor(private http: HttpClient) { } // Inyecta HttpClient para hacer peticiones HTTP

  /**
   * Envía los datos del formulario de contacto al backend.
   * @param formData Objeto con los datos del formulario (nombre, email, mensaje).
   * @returns Un Observable<any> que representa la respuesta del backend.
   */
  sendContactForm(formData: ContactForm): Observable<any> {
    console.log('Frontend ContactService: Enviando datos al backend:', formData);
    return this.http.post<any>(this.apiUrl, formData);
  }
}
