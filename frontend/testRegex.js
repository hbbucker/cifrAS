const strictChordRegex = /^[A-G][#b]?(m|maj|dim|aug|sus|add|M)?\d*(b\d+|#\d+)?(\([^)]+\))?(\/([A-G][#b]?|\d+))?$/;
console.log(strictChordRegex.test("Em7/9"));
console.log(strictChordRegex.test("D/F#"));
console.log(strictChordRegex.test("A7(4)"));
console.log(strictChordRegex.test("C7M/9"));
