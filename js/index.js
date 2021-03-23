$(document).ready(
    function(){

        let date
        setup()

        /**
         * Alle Vorarbeiten für die Funktion des Skripts:
         *  - Zurücksetzten von Warnungen
         *  - Initialisieren von Variablen
         *  - etc.
         */
        function setup(){
            moment.locale("de")
            date = moment()

            $("#classes-wrapper").hide()
            resetWarnings()
            loadJobs()
        }

        /**
         * Abfragen der Berufe und einsetzen in Dropdown.
         */
        function loadJobs(){
            $.getJSON("http://sandbox.gibm.ch/berufe.php")
                .done(function (jobs){
                        if (jobs.length > 0){
                            $.each(jobs, function (key, value){
                                if (localStorage.getItem("job") != null && value.beruf_id === localStorage.getItem("job")){
                                    $("#jobs").append(new Option(value.beruf_name, value.beruf_id, true, true))
                                    loadClasses(value.beruf_id)
                                }else {
                                    $("#jobs").append(new Option(value.beruf_name, value.beruf_id))
                                }
                            })
                        }
                    }
                ).fail(function(){
                errorDiv("Beim laden der Berufe ist ein Fehler aufgetreten", true)
            })
        }

        /**
         * Eventhandler bei Aushwahl eines Berufes aus dem Dropdown
         */
        $("#jobs").change(function (){
            const selectedJob = $("#jobs").find(":selected").val();
            localStorage.setItem("job", selectedJob)
            loadClasses(selectedJob)
        })

        /**
         * Eventhandler bei Auswahl einer Klasse aus dem Dropdown
         */
        $("#classes").change(function (){
            const selectedClass = $("#classes").find(':selected').val()
            localStorage.setItem("class", $("#classes").find(':selected').val())
            loadTimetable(selectedClass)
        })

        /**
         * Eventhandler bei Klick auf den Button für die vorherige Woche
         */
        $("#previousWeek").click(function (){
            date.subtract(1, "w")
            updateWeekSelector()
        })


        /**
         * Eventhandler bei Klick auf den Button für die nächste Woche
         */
        $("#nextWeek").click(function (){
            date.add(1, "w")
            updateWeekSelector()
        })

        /**
         * Updated then weekSelector mit dem neuen Datum
         */
        function updateWeekSelector(){
            $("#selectedWeek").text((date.week() + " - " + date.year()));
            loadTimetable($("#classes").find(':selected').val());
        }

        /**
         * Abfragen der Klassen des gewünschten Berufes und Einfügen in den Dropdown
         * @param jobId - ID des ausgewählten Berufs
         */
        function loadClasses(jobId){
            resetWarnings()
            $("#classes").find('option').remove().end();
            $.getJSON("http://sandbox.gibm.ch/klassen.php?beruf_id=" + jobId)
                .done(function (classes){
                    if (classes.length > 0){
                        $("#classes").append("<option selected disabled>-- Wähle eine Klasse aus --</option>")
                        $.each(classes, function (key, value){
                            if (localStorage.getItem("class") != null && value.klasse_id === localStorage.getItem("class")){
                                $("#classes").append(new Option(value.klasse_longname, value.klasse_id, true, true))
                                loadTimetable(value.klasse_id)
                            }else {
                                $("#classes").append(new Option(value.klasse_longname, value.klasse_id))
                            }
                        })
                        $("#classes-wrapper").fadeIn("fast")
                    }else{
                        $("#classes-wrapper").hide()
                        errorDiv("Für den gewählten Beruf sind keine Klassen vorhanden", false)
                    }
                }).fail(function () {
                errorDiv("Beim laden der Berufe ist ein Fehler aufgetreten", true)
            })
        }

        /**
         * Abfragen des Stundenplans der gewünschten Klasse und Einfügen in die Tabelle
         * @param classId - ID der gewünschten Klasse
         */
        function loadTimetable(classId){
            resetWarnings()
            $("#selectedWeek").text(date.week() + " - " + date.year());
            $("#weekSelector").show()
            $("#timetable tbody tr").remove().end()
            $.getJSON("http://sandbox.gibm.ch/tafel.php?klasse_id=" + classId + "&woche=" + date.week() + '-' + date.year())
                .done(function (timetable){
                    if (timetable.length > 0){
                        $("#timetable-wrapper").fadeIn("fast")
                        $.each(timetable, function (key, value){
                            $("#timetable").append(
                                "<tr>" +
                                "<td>" + value.tafel_datum + "</td>" +
                                "<td>" + moment(value.tafel_datum).format("dddd") + "</td>" +
                                "<td>" + value.tafel_von + "</td>" +
                                "<td>" + value.tafel_bis + "</td>" +
                                "<td>" + value.tafel_longfach + "</td>" +
                                "<td>" + value.tafel_lehrer + "</td>" +
                                "<td>" + value.tafel_raum + "</td>" +
                                "</tr>")
                        })
                    }else{
                        errorDiv("Für den Zeitraum ist kein Stundenplan vorhanden", false)
                    }
                })
                .fail(function(){
                    errorDiv("Beim laden des Stundenplanes ist ein Fehler aufgetreten", true)
                })
        }

        /**
         * Erstellen und einfügen eines <div>
         * @param error - Fehlermeldung als String
         * @param fatal - boolean ob es ein fataler Fehler ist
         */
        function errorDiv(error, fatal){
            if (fatal){
                $(".content").append(
                    "<div id=\"error\" class=\"alert alert-danger\" role=\"alert\">\n" + error + "</div>"
                ).fadeIn("fast")
            }else {
                $(".content").append(
                    "<div id=\"error\" class=\"alert alert-warning\" role=\"alert\">\n" + error + "</div>"
                ).fadeIn("fast")
            }
        }

        /**
         * Reseten aller Fehlermeldungen
         */
        function resetWarnings(){
            $("#timetable-wrapper").hide()
            $("#weekSelector").hide()

            $("#error").remove()
        }
    }
)
