import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContactForm, ContactService } from '../contact.service';
import { ContactModalService } from '../contact-modal.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit, OnDestroy {
  isOpen = false;
  isServiceConfigured = false;

  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };

  isSubmitting = false;
  submitMessage: string | null = null;
  isSuccess = false;

  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private contactModalService: ContactModalService
  ) { }

  ngOnInit(): void {
    this.isServiceConfigured = this.contactService.isConfigured();

    // Suscribirse al servicio del modal
    this.contactModalService.openModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.openModal();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Abre el modal de contacto.
   */
  openModal(): void {
    this.isOpen = true;
    this.resetForm();
    this.submitMessage = null;
    this.isSuccess = false;
    // Prevenir scroll en el body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal de contacto.
   */
  closeModal(): void {
    this.isOpen = false;
    // Restaurar scroll en el body
    document.body.style.overflow = '';
  }

  /**
   * Cierra el modal con la tecla Escape.
   */
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

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
        // Cerrar el modal después de 2 segundos si el envío fue exitoso
        setTimeout(() => {
          this.closeModal();
        }, 2000);
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
