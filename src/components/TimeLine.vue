<script>
import 'chartjs-plugin-colorschemes';
import 'chartjs-plugin-zoom';
import { Line } from 'vue-chartjs';

/* 20211028: chartjs commit 484f0d1e518963436d5013f61001558ef9788edf in 2.9.4
 * breaks option scales.xAxes[0].maxRotation = 0. Use version 2.9.3 for now. */

export default {
    extends: Line,
    data() {
        return {
            chartdata: {
                datasets: [
                    {
                        data: [],
                        radius: 6,
                        fill: false,
                        borderWidth: 5,
                        backgroundColor: '#17b8ce',
                        borderColor: '#17b8ce',
                        pointHoverBackgroundColor: '#D100E4',
                        pointHoverBorderColor: '#D100E4',
                        pointHoverRadius: 13,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                onClick: this.handleClick,
                title: { display: false },
                tooltips: {
                    titleMarginBottom: -2,
                    titleFontSize: 10,
                    xPadding: 4,
                    yPadding: 4,
                    caretPadding: 5,
                    callbacks: {
                        label: (tooltipItems, data) => data.labels[tooltipItems.index],
                    },
                    xAlign: 'center',
                    yAlign: 'bottom',
                },
                legend: {
                    display: false,
                },
                scales: {
                    xAxes: [
                        {
                            type: 'time',
                            time: {
                                displayFormats: {
                                    millisecond: 'hh:mm:ss.SSS',
                                    second: 'hh:mm:ss',
                                    minute: 'hh:mm',
                                    hour: 'MMM D hh:mm',
                                    day: 'MMM D hh:mm',
                                    week: 'MMM D',
                                    month: 'MMM YYYY',
                                    quarter: 'MMM - YYYY',
                                    year: 'MMM YYYY',
                                },
                            },
                            ticks: {
                                min: new Date().getTime() - 15 * 86400 * 1000,
                                max: new Date().getTime(),
                                maxRotation: 0,
                                autoSkipPadding: 25,
                                fontSize: 10,
                                fontFamily: 'Roboto, sans-serif',
                            },
                        },
                    ],
                    yAxes: [
                        {
                            display: false,
                            ticks: {
                                max: 20,
                                min: 0,
                                display: false,
                            },
                        },
                    ],
                },
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.Paired12',
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            enabled: true,
                            drag: false,
                            mode: () => 'x',
                        },
                    },
                },
                elements: {
                    line: {
                        tension: 0,
                    },
                },
            },
            selectedIndex: -1,
            selectedDatabase: null,
        };
    },
    computed: {
        routeEntity() {
            return this.$route.query.entity;
        },
        routeDatabase() {
            return this.$route.query.db;
        },
        storeEntityDatabases() {
            return this.$store.state.storeEntityDatabases;
        },
    },
    methods: {
        /**
         * Update the timeline databases with new data.
         * @param {object[]} newDatabases - Databases fetched from API upon entity change/selection.
         */
        updateTimeLineDbs(newDatabases) {
            /* Format databases for chartjs and select one */
            this.chartdata.datasets[0].data = newDatabases.map((db, dbIndex) => {
                const formattedDb = {
                    x: db.ts * 1000,
                    y: 9,
                    databaseId: db.id,
                };

                /* If a db is provided in the URL and it matches any of the new dbs, 
                select it in the Timeline */
                if (db.id === this.routeDatabase) {
                    this.selectedIndex = dbIndex;
                    this.selectedDatabase = formattedDb;
                }

                return formattedDb;
            });

            this.chartdata.datasets[0].pointBackgroundColor = this.colorOnClick;
            this.chartdata.datasets[0].pointBorderColor = this.colorOnClick;

            if (this.$data._chart) {
                this.$data._chart.update();
            }
        },
        /**
         * Return colors array
         * The array returned is used to match the selected timeline point to be different
         * @returns {Array}
         */
        colorOnClick() {
            const colors = [];
            colors[this.selectedIndex] = '#D100E4';
            return colors;
        },
        /**
         * Update store database value
         * @param {Object} point - PointerEvent
         * @param {Array} event - ChartElement
         */
        handleClick(point, event) {
            let clickedItem = null;

            if (Array.isArray(event)) {
                clickedItem = event[0];
            }

            if (!clickedItem) {
                return;
            } else {
                const clickedDb = this.chartdata.datasets[0].data[clickedItem._index].databaseId;

                /* New DB is clicked > update the URL */
                if (clickedDb !== this.routeDatabase) {
                    this.redirectToUpdateDb(clickedDb);
                }
            }
        },
        /**
         * Update the Timeline selected point
         * @param {string} newDb - The ID of the new DB to select
         */
        selectTimelineDb(newDb) {
            let foundDb = null;
            let foundIndex = -1;

            this.chartdata.datasets[0].data.forEach((db, dbIndex) => {
                if (db.databaseId === newDb) {
                    foundIndex = dbIndex;
                    foundDb = db;
                }
            });

            if (foundDb) {
                [this.selectedDatabase, this.selectedIndex] = [foundDb, foundIndex];
            }

            if (this.$data._chart) {
                this.$data._chart.update();
            }
        },
        /**
         * Redirect to an updated URL with a database ID
         * @param {string} dbToUpdate - The ID of the new DB to update in the URL
         */
        redirectToUpdateDb(dbToUpdate) {
            const redirection = { ...this.$route };
            const newQuery = { ...this.$route.query };
            newQuery.db = dbToUpdate;
            redirection.query = newQuery;

            this.$router.push(redirection).catch(() => {});
        },
    },
    watch: {
        storeEntityDatabases: {
            immediate: true,
            handler(newEntityDatabases) {
                if (newEntityDatabases) {
                    this.updateTimeLineDbs(newEntityDatabases);
                }
            },
        },
        routeDatabase: {
            immediate: true,
            handler(newDb) {
                /* If the DB in the URL changes, select it in the Timeline */
                this.selectTimelineDb(newDb);
            },
        },
    },
    mounted() {
        this.renderChart(this.chartdata, this.options);
    },
};
</script>

<style></style>
