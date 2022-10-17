//* nem őrzi meg a sorrendet
// const teszt1 = {
// 	A: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: ""
// },
// B: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: ""
// },
// C: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: ""
// },
// D: { 1: "", 2: "", 3: "F", 4: "F", 5: "", 6: "", 7: "", 8: ""
// },
// "9": { 1: "", 2: "", 3: "F", 4: "F", 5: "F", 6: "F", 7: "F", 8: ""
// },
// F: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: ""
// }
// }

/* const teszt = new Map();
teszt.set("A",12345678)
teszt.set("B",12345678)
teszt.set("C",12345678)

const dsor = new Map();
	dsor.set(1,"")
	dsor.set(2,"")
	dsor.set(3,"F")
	dsor.set(4,"F")
	dsor.set(5,"")
	dsor.set(6,"")
	dsor.set(7,"")
	dsor.set(8,"")
teszt.set("D",dsor)

teszt.set("E",12345678)
teszt.set("F",12345678)
console.log(teszt.get("D").get(4)) */


function generateSeats(numberOfRows, numberOfSeatsperRow) {
    const rowSymbols = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
    let ret = new Map();

    for (let i = 0; i < numberOfRows; i++) {
        ret.set(rowSymbols[i], new Map());
        for (let j = 1; j < numberOfSeatsperRow + 1; j++) {
            ret.get(rowSymbols[i]).set(j);
        }
    }
    return ret;
}


function renderSelect() {
   
    let movieSelectHTML = `
    <form id="select-movie-form" class="movie-form">
    <label class="w-100">
    Válassz filmet!
    <select name="selectedMovie" onchange="selectChange()">`;
    for (movie in movies) { 
      if (movies[movie].id != undefined) 
        movieSelectHTML += `<option value="${movies[movie].id}">${movies[movie].name} (${movies[movie].price} Ft)</option>`
    }

    movieSelectHTML += `
    </select>
    </label>
    </form>`
    document.querySelector('.select-movie-container').innerHTML = movieSelectHTML
}


function renderSeats(selectedId) {
    let selectedMovie = movies[selectedId]
    let nOfRows = selectedMovie.numberOfRows;
    let nOfSeats = selectedMovie.numberOfSeats;
    let seatMap = generateSeats(nOfRows, nOfSeats);

    for (bookedSeat of selectedMovie.bookedSeats) {
        seatMap.get(bookedSeat.row).set(bookedSeat.number, "Foglalt");
    }


    let rowsHTML = ""
    let firstRow = "<div class='row-symbol'></div>";

    seatMap.get("A").forEach((seat, seatKey) => {
        firstRow += `<div class="column-number">${seatKey}</div>`;
    });
    rowsHTML += `<div class="seat-row">${firstRow}</div>`;


    seatMap.forEach((rowValue, rowKey) => {
            //* egy sor
        let singleRowHTML = ""

        rowValue.forEach((seatValue, seatKey) => {
                //* soron belüli szék
            singleRowHTML += `
                <div
                class="seat ${seatValue === 'Foglalt' ? 'occupied': ''}"
                data-row="${rowKey}"
                data-seat="${seatKey}"
                >
                </div>`;
        }); 
        rowsHTML += `
            <div class="seat-row">
            <span class="row-symbol me-2">${rowKey}</span>
            ${singleRowHTML}
            </div>`;
    });
    document.querySelector(".movie-inner-container").innerHTML =  rowsHTML;
    addSelectedSeat();
}


function selectChange() {
  let opts = document.querySelector('[name="selectedMovie"]')
  if (movies.selectedSeats.length === 0) {
    movies.selectedId = opts.options[opts.selectedIndex].value-1 //* value - 1 = index
    renderSeats(movies.selectedId)
  } else {
    alert('Töröld a kiválasztott székeket másik film választásához!')
  }

}


function addSelectedSeat() {
  let seats = document.querySelectorAll('.seat')
  let clicked = {}
  seats.forEach((value, index) => { 
    value.addEventListener('click', () => {
        clicked = { 
          "row": value.attributes['data-row'].value, 
          "number": value.attributes['data-seat'].value
        }
        let find = movies.selectedSeats.findIndex(e =>  {
          return (e.row == value.attributes['data-row'].value && e.number == value.attributes['data-seat'].value) 
        })
        if (find === -1 && !value.classList.contains('occupied')) {
          movies.selectedSeats.push(clicked);
          value.classList.add('selected');
        }else {
          movies.selectedSeats.splice(find, 1)
          value.classList.remove('selected');
        }
        console.log();
        document.getElementById('count').innerHTML = movies.selectedSeats.length
        document.getElementById('total').innerHTML = movies.selectedSeats.length * movies[movies.selectedId].price
    });
  }); 
}



let movies = {}

fetch('https://kodbazis.hu/api/movies')
    .then(res => res.ok ? res.json(): [])
    .then(movies_res => {
        movies = movies_res;
        console.log(movies_res[-1]);
        movies.selectedId = 0;
        movies.selectedSeats = [];
        renderSelect();
        selectChange();
});

document.addEventListener('submit', (event) => { 
  event.preventDefault();
  fetch(`https://kodbazis.hu/api/book-seats/${movies.selectedId}`, {
    method: 'POST',
    body: movies.selectedSeats,
    headers: { 
			'Content-Type': 'application/json',
		}
  });
  movies.selectedSeats = []
  document.querySelectorAll('.seat').forEach((val, ind) => {
    if (val.classList.contains('selected')) {
      val.classList.add('occupied')
      val.classList.remove('selected')
    }
});
  document.querySelector('[name="name"][placeholder="Név"]').value = ""
  document.getElementById('count').innerHTML = "0"
  document.getElementById('total').innerHTML = "0"
});




    // TODO: Önálló feladat:
    /*
1. Bármelyik filmet ki lehessen választani
  - A renderelés során jelenítsd meg a filmválasztó inputot és
    dinamikusan generálj bele option-öket minden egyes film kapcsán!
  - Hozz létre új state változót selectedId néven!
  - Form change eseményre reagálva írd be a kiválasztott értéket a
    state változó alá!
  - Módosítsd a renderelő függvényt, hogy a selectedId-nak megfelelő
    filmet rajzolja ki

2. Lehessen üléseket kiválasztani
  - Hozz létre state változót selectedSeats néven és
    inicializáld üres tömb értékkel!
  - Kattintás eseményre tegyél a tömbbe egy adott ülést
    beazonosító elemet, az alábbi séma szerint:
      { row: "H", number: 6 }
  - Rendereléskor a selectedSeats tartalmának függvényében az
    adott ülés-elementhez add hozzá a "selected" class-t!

3. Lehessen leadni a foglalást
  - Form submitkor küldd meg a selectedSeats értékét AJAX kéréssel, az
    alábbi URL-re, JSON formátumban:
  - POST https://kodbazis.hu/api/book-seats/${movieId}

Sok sikert!
*/