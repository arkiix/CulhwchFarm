import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { StoreContext } from '../..';


function FlagsDoughnut() {
  const {flagsStore} = useContext(StoreContext);
  
  ChartJS.register(ArcElement, Tooltip, Legend);

  const options = {
    maintainAspectRatio: false,
    plugins:{
      legend: {
        display: false
      }
    }
  };
  
  const data = {
    labels: ['QUEUED', 'ACCEPTED', 'SKIPPED', 'REJECTED'],
    datasets: [
      {
        label: 'Count',
        data: [flagsStore.flagsInfo.queued, flagsStore.flagsInfo.accepted, flagsStore.flagsInfo.skipped, flagsStore.flagsInfo.rejected],
        backgroundColor: [
          '#6765EE',
          '#1E976A',
          '#EE6586',
          '#B51522'
        ],
        borderWidth: 0,
      },
    ],
  };

  
  return <Doughnut data={data} options={options} />;
}

export default observer(FlagsDoughnut);