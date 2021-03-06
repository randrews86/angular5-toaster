import {Component, Input, Output, ViewChild, ViewContainerRef, EventEmitter,
    ComponentFactoryResolver, ChangeDetectorRef, OnInit, AfterViewInit
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Toast} from './toast';
import {BodyOutputType} from './bodyOutputType';

@Component({
    selector: '[toastComp]',
    template: `
        <i class="toaster-icon" [ngClass]="iconClass"></i>
        <div class="toast-content">
            <div [ngClass]="toast.toasterConfig?.titleClass">{{toast.title}}</div>
            <div [ngClass]="toast.toasterConfig?.messageClass" [ngSwitch]="toast.bodyOutputType">
                <div *ngSwitchCase="bodyOutputType.Component" #componentBody></div>
                <div *ngSwitchCase="bodyOutputType.TrustedHtml" [innerHTML]="toast.body"></div>
                <div *ngSwitchCase="bodyOutputType.Default">{{toast.body}}</div>
            </div>
        </div>
        <div [ngClass]="toast.closeDivClass" *ngIf="toast.showCloseButton" (click)="click($event, toast)"
            [innerHTML]="safeCloseHtml">
        </div>`
})

export class ToastComponent implements OnInit, AfterViewInit {

    @Input() toast: Toast;
    @Input() iconClass: string;
    @ViewChild('componentBody', { read: ViewContainerRef }) componentBody: ViewContainerRef;

    safeCloseHtml: SafeHtml;

    public bodyOutputType = BodyOutputType;

    @Output()
    public clickEvent = new EventEmitter();

    constructor(
      private sanitizer: DomSanitizer,
      private componentFactoryResolver: ComponentFactoryResolver,
      private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Not sanitizing the close button html
        if (this.toast.closeHtml) {
            this.safeCloseHtml = this.sanitizer.bypassSecurityTrustHtml(this.toast.closeHtml);
        }

        // Default the close button div tag class if one isn't passed or configured
        if (this.toast.showCloseButton && !this.toast.closeDivClass) {
            if (this.toast.toasterConfig && this.toast.toasterConfig.closeDivClass) {
                this.toast.closeDivClass = this.toast.toasterConfig.closeDivClass;
            } else {
                this.toast.closeDivClass = 'toast-close-button';
            }
        }
    }

    ngAfterViewInit() {
        if (this.toast.bodyOutputType === this.bodyOutputType.Component) {
            const component = this.componentFactoryResolver.resolveComponentFactory(this.toast.body);
            const componentInstance: any = this.componentBody.createComponent(component, undefined, this.componentBody.injector);
            componentInstance.instance.toast = this.toast;
            this.changeDetectorRef.detectChanges();
        }
    }

    click(event: MouseEvent, toast: Toast) {
        event.stopPropagation();
        this.clickEvent.emit({
            value : { toast: toast, isCloseButton: true}
        });
    }
}
