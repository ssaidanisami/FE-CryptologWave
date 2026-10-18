import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { TranslationService } from '@fe-cryptolog-wave/shared-utils';

export type ConfirmationSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast';

export interface ConfirmationOptions {
  /** Translation key of the message to display. */
  messageKey: string;
  /** Interpolation params for the message. */
  messageParams?: Record<string, string | number>;
  /** PrimeIcons class, defaults to `pi pi-exclamation-triangle`. */
  icon?: string;
  /** Translation key for the accept button, defaults to `common.confirm.yes`. */
  acceptLabelKey?: string;
  /** Translation key for the reject button, defaults to `common.confirm.no`. */
  rejectLabelKey?: string;
  /** Severity of the accept button, defaults to the `severity` input. */
  acceptSeverity?: ConfirmationSeverity;
}

/**
 * Shared confirmation popup anchored to the element that triggered it.
 *
 * Usage:
 * ```html
 * <lib-confirmation-selector #confirmation></lib-confirmation-selector>
 * <button (click)="confirmation.confirm($event, { messageKey: 'x.confirmDelete' }).subscribe(ok => ok && remove())">
 * ```
 */
@Component({
  selector: 'lib-confirmation-selector',
  standalone: true,
  imports: [CommonModule, ConfirmPopupModule],
  providers: [ConfirmationService],
  templateUrl: './confirmation-selector.component.html',
  styleUrl: './confirmation-selector.component.scss',
})
export class ConfirmationSelectorComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translationService = inject(TranslationService);

  /** Default severity of the accept button. */
  @Input() severity: ConfirmationSeverity = 'danger';

  /**
   * Opens the popup next to the event target.
   * Emits `true` when accepted, `false` when rejected, then completes.
   */
  confirm(event: Event, options: ConfirmationOptions): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.confirmationService.confirm({
        target: event.currentTarget as EventTarget,
        message: this.translationService.translate(
          options.messageKey,
          options.messageParams
        ),
        icon: options.icon ?? 'pi pi-exclamation-triangle',
        acceptButtonProps: {
          label: this.translationService.translate(
            options.acceptLabelKey ?? 'common.confirm.yes'
          ),
          severity: options.acceptSeverity ?? this.severity,
          size: 'small',
        },
        rejectButtonProps: {
          label: this.translationService.translate(
            options.rejectLabelKey ?? 'common.confirm.no'
          ),
          severity: 'secondary',
          outlined: true,
          size: 'small',
        },
        accept: () => {
          subscriber.next(true);
          subscriber.complete();
        },
        reject: () => {
          subscriber.next(false);
          subscriber.complete();
        },
      });
    });
  }
}
