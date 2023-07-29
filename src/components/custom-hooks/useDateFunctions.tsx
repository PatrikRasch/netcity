import React, { useState, useEffect } from "react";

export function useDateFunctions() {
  const [dateDayMonthYear, setDateDayMonthYear] = useState("");
  const [fullTimestamp, setFullTimestamp] = useState({});

  //1 Set up new date
  const date = new Date();

  //1 Turn month number into text
  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  //1 Turn all dates into readable text
  const fullDate = (monthNumber: number) => {
    const day = date.getDate().toString();
    const month = getMonthName(monthNumber).toString();
    const year = date.getFullYear().toString();
    return day + " " + month + " " + year;
  };

  //1 Take snapshot of dates
  useEffect(() => {
    setFullTimestamp(date);
    setDateDayMonthYear(fullDate(date.getMonth() + 1));
  }, []);

  return { fullTimestamp, dateDayMonthYear };
}
