import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { StoreContext } from '../..';


function FlagsDoughnut() {
    const {flagsStore} = useContext(StoreContext);

    ChartJS.register(ArcElement, Tooltip, Legend);

    let donData = [flagsStore.flagsInfo.queued, flagsStore.flagsInfo.accepted, flagsStore.flagsInfo.skipped, flagsStore.flagsInfo.rejected];
    let labels = ['QUEUED', 'ACCEPTED', 'SKIPPED', 'REJECTED'];
    let backgroundColor = ['#6765EE', '#1E976A', '#EE6586', '#B51522'];
    let showTooltip = true;

    if (donData.every((elem) => elem === 0)) {
        donData = [1];
        labels = ['GUG'];
        backgroundColor = ['#decece'];
        showTooltip = false;
    };

    const options = {
        maintainAspectRatio: false,
        plugins:{
            legend: {
                display: false
            },
            tooltip: {
                enabled: showTooltip
            }
        }
    };

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Count',
                data: donData,
                backgroundColor: backgroundColor,
                borderWidth: 0,
            }
        ]
    };

    return <Doughnut data={data} options={options} />;
}

export default observer(FlagsDoughnut);