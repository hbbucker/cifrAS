const strictChordRegex = /^[A-G][#b]?(m|M|maj|dim|aug|sus|add)?\d*(m|M|maj|dim|aug|sus|add)?(b\d+|#\d+)?(\([^)]+\))?(\/([A-G][#b]?|\d+))?$/;
console.log(strictChordRegex.test("Em7/9"));
console.log(strictChordRegex.test("D/F#"));
console.log(strictChordRegex.test("A7(4)"));
console.log(strictChordRegex.test("C7M/9"));
console.log(strictChordRegex.test("F#m7(b5)"));
console.log(strictChordRegex.test("G(add9)"));
