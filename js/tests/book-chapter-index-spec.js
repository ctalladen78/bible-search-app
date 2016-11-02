
// when book-index route is called
// book index controller should call db.getDocs
// scope.booklist = db.getDocs

// when book/chapter-index is called
// chapter index controller should call db.getChapters
// scope.chaplist = db.getChapters

// when book/chapter/verse-index is called
// verse index controller should call db.getVerses
// scope.verseList = db.getVerses

/*
model object
{bible:[
  bookName:string
  bookList: [
    {
    book:string,
    version: string,
    chapter: number,
    verse: number,
    text: bigstring
    }
  ]
]}
*/
