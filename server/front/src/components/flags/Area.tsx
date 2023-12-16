import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { StoreContext } from '../..';


function FlagsDoughnut() {
  const {flagsStore} = useContext(StoreContext);
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scaleFontColor: "#FFFFFF",
    scales: {
      yAxis: {
        min: 0
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
    },
  };
  
  const labels = ['-5', '-4', '-3', '-2', '-1', 'current round'];  // Add dynamic (flagsStore.count_rounds)

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Total flags',
        data: flagsStore.flagsInfo.rounds_info,
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      },
    ],
  };
  
  return <Line data={data} options={options} />;
}

export default observer(FlagsDoughnut);