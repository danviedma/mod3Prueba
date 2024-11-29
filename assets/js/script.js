async function getMoney() {
    try {
        const res = await fetch('https://mindicador.cl/api/');  // URL incorrecta para simular el error
        if (!res.ok) {
            throw new Error('Error al obtener los datos, respuesta HTTP no válida');
        }
        const data = await res.json();
        return data;
    } catch (error) {
        const errorMessage = document.querySelector('#errorMessage');
        errorMessage.innerHTML = 'Hubo un error al obtener los datos. Intenta nuevamente más tarde.';
        console.log(errorMessage.innerHTML);
        errorMessage.style.color = 'red'; 
        errorMessage.style.display = 'block';
        return null; 
    }
}



const btnConvertir = document.querySelector('#btnConvertir');

let chartInstance = null; // Variable global para guardar la instancia del gráfico

btnConvertir.addEventListener('click', async () => {
    const data = await getMoney();

    if (!data) {
        return;  
    }

    const inputPesos = document.querySelector('#pesos');
    const selectMoneda = document.querySelector('#moneda');
    const resultado = document.querySelector('#resultado');

    if (inputPesos.value === '') {
        alert('Ingrese un valor');
        return;
    } else if (isNaN(inputPesos.value)) {
        alert('Ingrese un valor numérico');
        return;
    }

    let dolar = 0;
    let euro = 0;
    let uf = 0;

    const pesos = parseFloat(inputPesos.value);
    const valorDolar = data.dolar.valor;
    const valorEuro = data.euro.valor;
    const valorUF = data.uf.valor;

    dolar = pesos / valorDolar;
    euro = pesos / valorEuro;
    uf = pesos / valorUF;

    if (selectMoneda.value === 'dolar') {
        resultado.innerHTML = `${dolar.toFixed(2)} USD`;
    } else if (selectMoneda.value === 'euro') {
        resultado.innerHTML = `${euro.toFixed(2)} EUR`;
    }else if (selectMoneda.value === 'uf') {
        resultado.innerHTML = `${uf.toFixed(2)} UF`;
    } 
    else {
        resultado.innerHTML = 'Seleccione una moneda válida';
        return;
    }

    // ************* Modificar el gráfico **************
    async function renderGrafica() {
        const data = await getAndCreateDataToChart(selectMoneda.value);
        const config = {
            type: "line",
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: { title: { display: true, text: 'Fecha' } },
                    y: { title: { display: true, text: 'Valor en CLP' } }
                }
            }
        };

        if (chartInstance) {
            chartInstance.destroy();
        }
        const myChart = document.getElementById("myChart").getContext("2d");
        chartInstance = new Chart(myChart, config);
    }

    renderGrafica();
});


async function getAndCreateDataToChart(moneda) {
    const res = await fetch(`https://mindicador.cl/api/${moneda}`);
    const monedaData = await res.json();

    const series = monedaData.serie.slice(0, 10).reverse();

    const labels = series.map((item) => {
        const fecha = new Date(item.fecha);
        return fecha.toLocaleDateString(); 
    });

    const data = series.map((item) => {
        return item.valor;
    });

    const datasets = [
        {
            label: `Historial de ${moneda}`,
            borderColor: "rgb(75, 192, 192)", // Color de la línea
            data,
            fill: false, // Sin relleno debajo de la línea
        }
    ];

    return { labels, datasets };
}







