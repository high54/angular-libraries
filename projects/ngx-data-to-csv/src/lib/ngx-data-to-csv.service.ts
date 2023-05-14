import { Injectable } from '@angular/core';
import { Config, ConfigDefaults, CsvConfigConsts } from './model';

type GenericObject = {
  [key: string]: bigint | boolean | null | number | string;
};
/**
 * 
 * # Ngx Data To CSV
 * 
 * usage:
 * 
 * ```ts
 *  private service: NgxDataToCsvService = inject(NgxDataToCsvService);
 *  // or using constructor
 *  constructor(private service: NgxDataToCsvService) {}
 * 
 *  onClick(data: MyDataType[]): void {
 *    this.service.toCsv(data, 'filename');
 *  }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class NgxDataToCsvService {

  private data: GenericObject[] | undefined | null;
  private options!: Config;
  private csv = '';

  public toCsv(dataToTransform: any, filename: string, config?: Config): string | void {
    this.csv = '';

    this.data = typeof dataToTransform != 'object' ? this.parseJson(dataToTransform) : dataToTransform;
    if (!this.data) {
      return;
    }
    this.options = { ...ConfigDefaults, ...config };

    if (filename) {
      this.options.filename = filename;
    }

    if (this.options?.useByteOrderMark) {
      this.csv += CsvConfigConsts.ByteOrderMark;
    }

    if (this.options?.showTitle) {
      this.csv += this.options?.title + '\r\n\n';
    }

    const keys = this.extractUniqueKeys(this.data);
    const csvData = [];

    csvData.push(keys.join(this.options.fieldSeparator)); // CSV header

    for (const obj of this.data) {
      const row = keys.map(key => this.formatCellValue(obj, key));
      csvData.push(row.join(this.options.fieldSeparator));
    }
    this.csv += csvData.join(CsvConfigConsts.END_OF_LINE);

    if (this.csv == '') {
      console.log("Invalid data");
      return;
    }

    if (this.options?.noDownload) {
      return this.csv;
    }

    this.downloadCsvFile();

  }

  getNestedValues(data: GenericObject[], key: string): any[] {
    return data.map(obj => this.getNestedObjectValue(obj, key));
  }

  private getNestedObjectValue(obj: GenericObject, key: string): any {
    const keys = key.split('.');
    let current: any = obj;

    for (const key of keys) {
      const match = key.match(/(\w+)\[(\d+)\]/);
      if (match) {
        current = current[match[1]][match[2]];
      } else {
        current = current[key];
      }
    }

    return current;
  }

  extractUniqueKeys(arr: GenericObject[], keyPrefix = ''): string[] {
    const keys = new Set<string>();

    function extract(obj: GenericObject, currentKeyPrefix: string): void {
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          (obj[key] as any).forEach((item: GenericObject, index: number) => {
            extract(item, `${currentKeyPrefix}${key}[${index}].`);
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          extract(obj[key] as any, `${currentKeyPrefix}${key}.`);
        } else {
          keys.add(`${currentKeyPrefix}${key}`);
        }
      }
    }

    arr.forEach((item: GenericObject) => extract(item, keyPrefix));

    return Array.from(keys);
  }
  private parseJson(jsonString: string): GenericObject[] | null {
    try {
      const parsedData = JSON.parse(jsonString);
      if (typeof parsedData === 'object' && parsedData !== null) {
        return parsedData;
      }
    } catch (error) {
      console.log('Invalid JSON:', error);
    }
    return null;
  }
  private formatCellValue(obj: GenericObject, key: string): string {
    let value = this.getNestedObjectValue(obj, key);
    if (typeof value === 'object' && value !== null) {
      value = JSON.stringify(value);
    }
    const strValue = String(value).replace(/"/g, '""');
    return `"${strValue}"`;
  }

  private downloadCsvFile(): void {
    const blob = new Blob([this.csv], { type: "text/csv;charset=utf8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.setAttribute('target', '_blank');
    link.setAttribute('visibility', 'hidden');
    link.download = this.options?.filename?.replace(/ /g, "_") + ".csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}