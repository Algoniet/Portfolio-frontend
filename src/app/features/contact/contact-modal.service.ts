import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactModalService {
  private openModalSubject = new Subject<void>();
  openModal$ = this.openModalSubject.asObservable();

  /**
   * Emite el evento para abrir el modal de contacto.
   * Este método puede ser llamado desde cualquier componente.
   */
  openContactModal(): void {
    this.openModalSubject.next();
  }
}
