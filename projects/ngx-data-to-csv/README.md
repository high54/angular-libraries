# Ngx Data To CSV Documentation

## Installation

To install the Ngx Data To CSV package, use the following command in your console:

```sh
ng add ngx-data-to-csv
```
or 

```sh
npm install ngx-data-to-csv
```

## How to use

To use this service, you need to import and inject it into your Angular component.

1. Import `NgxDataToCsvService` into your component:

```ts
import { NgxDataToCsvService } from 'path/to/ngx-data-to-csv';
```

2. Inject the service into the constructor of your component:

```ts
constructor(private csvService: NgxDataToCsvService) {}
```

3. Use the `toCsv(data, filename, config?)` method to transform your data into CSV. This method takes three arguments:

    - `data`: the data you want to transform into CSV.
    - `filename`: the name of the CSV file to be created.
    - `config?`: an optional configuration object.

Here's an example of how to use the service in a component:

```ts
import { Component } from '@angular/core';
import { NgxDataToCsvService } from 'path/to/ngx-data-to-csv';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = [
    { lastName: 'Smith', firstName: 'John', age: 30 },
    { lastName: 'Doe', firstName: 'Jane', age: 25 },
  ];

  constructor(private csvService: NgxDataToCsvService) {}

  downloadCsv() {
    this.csvService.toCsv(this.data, 'myData');
  }
}
```

In this example, we have an array of data `data` that we want to transform into CSV. We injected `NgxDataToCsvService` into the constructor of our component, and we created a `downloadCsv` method that calls `csvService.toCsv` with our data and the desired filename.

## Configuration

The optional configuration object that you can pass to the `toCsv` method can contain the following keys:

- `filename`: the name of the CSV file. By default, it is 'csv.csv'.
- `fieldSeparator`: the field separator used in the CSV. By default, it is ','.
- `showTitle`: a boolean that determines whether the title should be displayed at the top of the CSV. By default, it is `false`.
- `title`: the title of the CSV. By default, it is 'CSV'.
- `useByteOrderMark`: a boolean that determines whether a byte order mark should be used. By default, it is `true`.
- `noDownload`: a boolean that determines whether the CSV should be downloaded or simply returned as a string. By default, it is `false`.

Here's an example of how to use it with configuration:

```ts
this.csvService.toCsv(this.data, 'myData', { showTitle: true, title: 'My Data', fieldSeparator: ';' });
```

In this example, the generated CSV file will have 'My Data' as the title and the fields will be separated by ';'.
