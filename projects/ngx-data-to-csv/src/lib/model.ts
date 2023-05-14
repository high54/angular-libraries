export interface Config {
    filename?: string;
    fieldSeparator?: string;
    showTitle?: boolean;
    title?: string;
    useByteOrderMark?: boolean;
    noDownload?: boolean;
}

export class CsvConfigConsts {

    public static END_OF_LINE = "\r\n";
    public static ByteOrderMark = "\ufeff";
    public static DEFAULT_FIELD_SEPARATOR = ',';
    public static DEFAULT_SHOW_TITLE = false;
    public static DEFAULT_TITLE = 'CSV';
    public static DEFAULT_FILENAME = 'csv.csv';
    public static DEFAULT_USE_BOM = true;
    public static DEFAULT_NO_DOWNLOAD = false;
}

export const ConfigDefaults: Config = {
    filename: CsvConfigConsts.DEFAULT_FILENAME,
    fieldSeparator: CsvConfigConsts.DEFAULT_FIELD_SEPARATOR,
    showTitle: CsvConfigConsts.DEFAULT_SHOW_TITLE,
    title: CsvConfigConsts.DEFAULT_TITLE,
    useByteOrderMark: CsvConfigConsts.DEFAULT_USE_BOM,
    noDownload: CsvConfigConsts.DEFAULT_NO_DOWNLOAD,
};