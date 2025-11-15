import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'toUrl'
})
export class ToUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(file: File | null): SafeUrl | null {
    if (!file) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }
}
