import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const arrayToExcel = (data, title) => {
  const excludeKeys = ["_id"];

  const filteredData = data.map((item) => {
    const newItem = { ...item };
    excludeKeys.forEach((key) => delete newItem[key]);
    return newItem;
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(filteredData);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const excelBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const excelTitle = `Bridged Media - ${title ? title : "Analytics"}.xlsx`;

  saveAs(excelBlob, excelTitle);
};
