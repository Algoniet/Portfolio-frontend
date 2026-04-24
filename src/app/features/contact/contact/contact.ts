import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactForm, ContactService } from '../contact.service';
import { ContactModalService } from '../contact-modal.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule, TranslateModule],
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
    private contactModalService: ContactModalService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.isServiceConfigured = this.contactService.isConfigured();

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

  openModal(): void {
    this.isOpen = true;
    this.resetForm();
    this.submitMessage = null;
    this.isSuccess = false;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = null;

    this.contactService.sendContactForm(this.contactForm).subscribe({
      next: (response) => {
        console.log('Mensaje enviado con éxito:', response);
        this.submitMessage = this.translate.instant('CONTACT.SUCCESS_MSG');
        this.isSuccess = true;
        this.resetForm();
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al enviar el mensaje:', error);
        this.submitMessage = this.translate.instant('CONTACT.ERROR_MSG');
        this.isSuccess = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
  }
}
