import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactForm, ContactService } from '../contact.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule,CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {

  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };

  isSubmitting: boolean = false;
  submitMessage: string | null = null;
  isSuccess: boolean = false;

  constructor(private contactService: ContactService) { }

  /**
   * Maneja el envío del formulario de contacto.
   */
  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = null;

    this.contactService.sendContactForm(this.contactForm).subscribe({
      next: (response) => {
        console.log('Mensaje enviado con éxito:', response);
        this.submitMessage = '¡Mensaje enviado con éxito! Te responderé pronto.';
        this.isSuccess = true;
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al enviar el mensaje:', error);
        this.submitMessage = 'Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.';
        this.isSuccess = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Resetea el formulario después de un envío exitoso.
   */
  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
  }
}
