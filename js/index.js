let date = new Date();

$(document).ready(setup())

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

Date.prototype.addWeek = function() {
    this.setDate(this.getDate() + 7);
}

Date.prototype.substractWeek = function() {
    this.setDate(this.getDate() - 7);
}

Date.prototype.getFullDay = function (day){
    switch (day){
        case "1": return "Montag";
        case "2": return "Dienstag";
        case "3": return "Mittwoch";
        case "4": return "Donnserstag";
        case "5": return "Freitag";
    }
}


function setup(){
    resetWarnings()
    loadJobs()
}

function loadJobs(){
    $.getJSON("http://sandbox.gibm.ch/berufe.php", function(jobs){
            if (jobs.length > 0){
                $.each(jobs, function (key, value){
                        $("#jobs").append(new Option(value.beruf_name, value.beruf_id))
                    })
            }
        }
    ).fail(function (){
        $("#jobLoadingError").show();
    })
}

$("#jobs").change(function (){
    loadClasses($("#jobs").find(":selected").val())
})

$("#classes").change(function (){
    date = new Date()
    loadTimetable($("#classes").find(':selected').val())
})

$("#previousWeek").click(function (){
    date.substractWeek()
    updateWeekSelector()
})

$("#nextWeek").click(function (){
    date.addWeek()
    updateWeekSelector()
})

function updateWeekSelector(){
    $("#selectedWeek").text((date.getWeek() < 10 ? "0" + date.getWeek() : date.getWeek()) + "-" + date.getFullYear());
    loadTimetable($("#classes").find(':selected').val());
}

function loadClasses(jobId){
    resetWarnings()
    $("#classes-wrapper").show()
    $("#classes").find('option').remove().end();
    $.getJSON("http://sandbox.gibm.ch/klassen.php?beruf_id=" + jobId, function (classes){
        if (classes.length > 0){
            $("#classes").append("<option selected disabled>-- Wähle eine Klasse aus --</option>")
            $.each(classes, function (key, value){
                $("#classes").append(new Option(value.klasse_longname, value.klasse_id))
            })
        }else{
            $("#classes-wrapper").hide()
            $("#noClassesAvailable").show()
        }
    }).fail(function () {
        $("#classLoadingError").show();
    })
}

function loadTimetable(classId){
    resetWarnings()
    $("#selectedWeek").text((date.getWeek() < 10 ? "0" + date.getWeek() : date.getWeek()) + "-" + date.getFullYear());
    $("#weekSelector").show()
    $("#timetable tbody tr").remove().end()
    $.getJSON("http://sandbox.gibm.ch/tafel.php?klasse_id=" + classId + "&woche=" + date.getWeek() + '-' + date.getFullYear(), function (timetable){
        if (timetable.length > 0){
            $("#timetable-wrapper").show()
            $.each(timetable, function (key, value){
                $("#timetable").append(
                    "<tr>" +
                    "<td>" + value.tafel_datum + "</td>" +
                    "<td>" + date.getFullDay(value.tafel_wochentag) + "</td>" +
                    "<td>" + value.tafel_von + "</td>" +
                    "<td>" + value.tafel_bis + "</td>" +
                    "<td>" + value.tafel_longfach + "</td>" +
                    "<td>" + value.tafel_lehrer + "</td>" +
                    "<td>" + value.tafel_raum + "</td>" +
                    "</tr>")
            })
        }else{
            $("#noTimetableAvailable").show()
        }
    })
}

function resetWarnings(){
    $("#timetable-wrapper").hide()
    $("#weekSelector").hide()

    $("#noClassesAvailable").hide()
    $("#noTimetableAvailable").hide()

    $("#classLoadingError").hide()
    $("#jobLoadingError").hide()
}
