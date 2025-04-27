document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const stocksContainer = document.getElementById('stocks-container');
    
    // Request data from the background script
    chrome.runtime.sendMessage({action: "getCachedData"}, function(response) {
      if (response && response.data && response.data.tickers && response.data.tickers.length > 0) {
        loadingElement.style.display = 'none';
        displayStockData(response.data);
      } else {
        loadingElement.textContent = 'No stock data available. Visit a financial article to analyze stocks.';
      }
    });
    
    function displayStockData(data) {
      const { tickers, plot_data } = data;
      
      // Clear the container
      stocksContainer.innerHTML = '';
      
      // Create a section for each ticker
      tickers.forEach(ticker => {
        const tickerData = plot_data[ticker];
        
        // Create container for this stock
        const stockDiv = document.createElement('div');
        stockDiv.className = 'stock-container';
        
        // Create header with ticker
        const headerDiv = document.createElement('div');
        headerDiv.className = 'stock-header';
        
        const titleElement = document.createElement('h2');
        titleElement.className = 'stock-title';
        titleElement.textContent = ticker;
        headerDiv.appendChild(titleElement);
        
        stockDiv.appendChild(headerDiv);
        
        // Handle errors or missing data
        if (tickerData && tickerData.error) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = tickerData.error;
          stockDiv.appendChild(errorDiv);
        } else if (tickerData && tickerData.data && tickerData.data.length > 0) {
          // Create chart container
          const chartContainer = document.createElement('div');
          chartContainer.className = 'chart-container';
          
          const canvas = document.createElement('canvas');
          canvas.id = `chart-${ticker}`;
          chartContainer.appendChild(canvas);
          
          stockDiv.appendChild(chartContainer);
          
          // Create the chart
          createChart(canvas, tickerData);
        } else {
          const noDataDiv = document.createElement('div');
          noDataDiv.className = 'no-data';
          noDataDiv.textContent = 'No data available for this stock';
          stockDiv.appendChild(noDataDiv);
        }
        
        // Add the stock div to the container
        stocksContainer.appendChild(stockDiv);
      });
    }
    
    function createChart(canvas, tickerData) {
      const ctx = canvas.getContext('2d');
      
      // Extract data
      const data = tickerData.data;
      const dates = data.map(item => item.date);
      const prices = data.map(item => item.price);
      const trends = data.map(item => item.trend);
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Stock Price',
              data: prices,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              yAxisID: 'y',
            },
            {
              label: 'Search Interest',
              data: trends,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              type: 'bar',
              yAxisID: 'y1',
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          stacked: false,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Price ($)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
              title: {
                display: true,
                text: 'Search Interest'
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    }
  });