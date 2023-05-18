import { Injectable } from '@angular/core';
import { Config, ConfigDefaults, CsvConfigConsts } from './model';

type GenericObject = {
  [key: string]: bigint | boolean | null | number | string;
};
interface DataObject {
  [key: string]: string | number | boolean | null;
}
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
 * ## Description
 *
 * The NgxDataToCsvService class provides a service to transform data into CSV format.
 * 
 * It provides methods to convert data (in the form of an object or a JSON string) into CSV format,
 * extract values from nested objects, extract unique keys from an array of objects,
 * parse a JSON string into an object, format cell values for inclusion in a CSV file, 
 * and to initiate the download of a CSV file.
 *
 * The class maintains a private property `data` to hold the data to be transformed,
 * a private property `options` to hold the configuration for the CSV output,
 * and a private property `csv` to hold the resulting CSV string.
 *
 * The main method `toCsv` is public and can be used to transform data into CSV format.
 * It takes the data to be transformed, the desired filename for the CSV file, 
 * and an optional configuration object as arguments. The configuration object allows for customizing
 * the CSV output, such as setting the field separator, showing a title, prepending a byte order mark, 
 * and deciding whether to download the CSV file or return it as a string. The `toCsv` method also
 * orchestrates the extraction of unique keys, the formatting of cell values, and the downloading of the CSV file.
 *
 * The other methods are private helper methods used by the `toCsv` method.
 */
@Injectable({
  providedIn: 'root'
})
export class NgxDataToCsvService {

  private data: GenericObject[] | undefined | null;
  private options!: Config;
  private csv = '';

  /**
   * This method transforms the provided data into a CSV format.
   *
   * @param {any} dataToTransform - The data to be transformed. This can be either a JavaScript object or a JSON string.
   * @param {string} filename - The desired name for the resulting CSV file.
   * @param {Config} config - An optional configuration object for customizing the CSV output.
   *
   * The configuration object can contain the following keys:
   * - filename: the name of the CSV file.
   * - fieldSeparator: the character used to separate fields in the CSV.
   * - showTitle: a boolean that determines whether to display a title in the CSV.
   * - title: the title to display in the CSV.
   * - useByteOrderMark: a boolean that determines whether to prepend a byte order mark to the CSV.
   * - noDownload: a boolean that determines whether to download the CSV or return it as a string.
   *
   * @returns {string | void} - If noDownload is set to true in the config, returns the CSV as a string. Otherwise, triggers a download of the CSV file and returns void.
   */
  public toCsv(dataToTransform: DataObject[], filename: string, config?: Config): string | void {
    this.csv = '';

    this.data = typeof dataToTransform != 'object' ? this.parseJson(dataToTransform) : dataToTransform;
    if (!this.data) {
      return;
    }
    this.options = { ...ConfigDefaults, ...config };

    if (filename) {
      this.options.filename = filename;
    }

    this.addByteOrderMarkAndTitle();

    const keys = this.extractUniqueKeys(this.data);

    // Add CSV header directly to the CSV string
    this.generateCsvHeader(keys);

    // Process each row individually and add it to the CSV string
    for (const obj of this.data) {
      this.generateCsvRow(obj, keys);
    }

    if (this.csv == '') {
      throw new Error("Invalid data");
    }

    if (this.options?.noDownload) {
      return this.csv;
    }

    this.downloadCsvFile();
  }

  /**
   * This method retrieves the value of a nested object property.
   *
   * @param {GenericObject} obj - The object from which to retrieve the value.
   * @param {string} key - The key used to locate the value. It supports a nested key in the form 'key1.key2.key3' or 'key1[index].key2'.
   *                        For example, for an object like `{ key1: { key2: { key3: 'value' }}}`, the method can be called with the key 'key1.key2.key3'.
   *                        Similarly, for an object like `{ key1: [{ key2: 'value' }] }`, the method can be called with the key 'key1[0].key2'.
   * @returns {any} - Returns the value of the specified key in the object. If the key is not found, it returns `undefined`.
   */
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

  /**
   * This method extracts the unique keys from an array of objects.
   * It is designed to handle nested objects and arrays as well.
   *
   * @param {GenericObject[]} arr - The array of objects from which to extract the keys.
   * @param {string} keyPrefix - An optional prefix to prepend to each key. Defaults to an empty string.
   *
   * The function operates recursively to handle nested structures. If a key points to an array,
   * it recursively extracts keys from each item in the array. If a key points to an object, it recursively
   * extracts keys from the object. In the base case, when a key points to a primitive value, it adds the key 
   * (with the current prefix) to the set of unique keys.
   *
   * @returns {string[]} - Returns an array of unique keys from the input array of objects.
   */
  private extractUniqueKeys(arr: GenericObject[], keyPrefix = ''): string[] {
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

  /**
   * This method attempts to parse a JSON string into an object.
   *
   * @param {string} jsonString - The JSON string to parse.
   *
   * The method uses the JSON.parse function to attempt to parse the input string.
   * If the parsing is successful and the result is an object, it returns the parsed object.
   * If the parsing fails or the result is not an object, it logs an error and returns null.
   *
   * @returns {GenericObject[] | null} - Returns the parsed object if the parsing is successful; otherwise, returns null.
   */
  private parseJson(jsonString: string): GenericObject[] | null {
    try {
      const parsedData = JSON.parse(jsonString);
      if (typeof parsedData === 'object' && parsedData !== null) {
        return parsedData;
      }
      throw new Error('Parsed data is not an object or is null');
    } catch (error: any) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }
  /**
   * This method formats a cell value for inclusion in a CSV.
   *
   * @param {GenericObject} obj - The object containing the cell value.
   * @param {string} key - The key identifying the cell value within the object.
   *
   * The method retrieves the value from the object using the provided key.
   * If the value is an object itself, it stringifies it using JSON.stringify.
   * If the value contains any double-quote characters ("), it replaces them with two double-quote characters ("") to escape them in the CSV.
   * The method then wraps the value in double-quote characters and returns it.
   *
   * @returns {string} - Returns the cell value formatted for inclusion in a CSV.
   */
  private formatCellValue(obj: GenericObject, key: string): string {
    let value = this.getNestedObjectValue(obj, key);
    if (typeof value === 'object' && value !== null) {
      value = JSON.stringify(value);
    }

    const strValue = String(value);
    // Only do the replacement if necessary
    const finalValue = strValue.includes('"') ? strValue.replace(/"/g, '""') : strValue;

    return `"${finalValue}"`;
  }

  /**
   * This method initiates the download of the CSV file.
   *
   * It first creates a new Blob object from the CSV string stored in this.csv, setting the Blob's MIME type to "text/csv;charset=utf8;".
   * It then creates a new 'a' element and sets its href attribute to a URL representing the Blob object.
   * The 'a' element's target attribute is set to '_blank' to open the download in a new tab or window, and its visibility is set to 'hidden' to avoid displaying it.
   * The 'a' element's download attribute is set to the filename specified in the options, with spaces replaced by underscores, and the extension ".csv" appended.
   * The 'a' element is then added to the document's body and its click method is called to start the download.
   * Finally, the 'a' element is removed from the document's body after the download has started.
   */
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

  /**
   * Adds the Byte Order Mark and title to the CSV string if specified in the options.
   *
   * The Byte Order Mark (BOM) is a Unicode character used to signal the endianness 
   * (byte order) of a text. It's optional and not all CSV parsers require or understand it.
   *
   * The title is a user-defined string that will be placed at the top of the CSV file,
   * separated from the rest of the data by two newline characters.
   */
  private addByteOrderMarkAndTitle() {
    if (this.options?.useByteOrderMark) {
      this.csv += CsvConfigConsts.ByteOrderMark;
    }

    if (this.options?.showTitle) {
      this.csv += this.options?.title + '\r\n\n';
    }
  }


  /**
   * Generates the CSV header row and appends it to the CSV string.
   * 
   * This method takes an array of keys, which represent the column headers in the CSV file,
   * and joins them together into a single string with the field separator defined in the options.
   * The field separator is typically a comma (,), but it could be any character.
   * 
   * After joining the keys, an end of line marker is appended to complete the header row.
   *
   * @param keys An array of strings representing the column headers for the CSV file.
   */
  private generateCsvHeader(keys: string[]) {
    this.csv += keys.join(this.options.fieldSeparator) + CsvConfigConsts.END_OF_LINE;
  }

  /**
   * Generates a CSV row from a given object and appends it to the CSV string.
   *
   * This method takes an object and an array of keys. The keys represent the fields
   * of the object that will be included in the CSV row. For each key, it retrieves 
   * the corresponding value from the object, formats it using the `formatCellValue` method,
   * and then joins these formatted values into a single string with the field separator defined in the options.
   *
   * After joining the values, an end of line marker is appended to complete the row.
   *
   * @param obj The object to convert into a CSV row.
   * @param keys An array of strings representing the fields of the object to include in the CSV row.
   */
  private generateCsvRow(obj: GenericObject, keys: string[]) {
    const row = keys.map(key => this.formatCellValue(obj, key));
    this.csv += row.join(this.options.fieldSeparator) + CsvConfigConsts.END_OF_LINE;
  }

}