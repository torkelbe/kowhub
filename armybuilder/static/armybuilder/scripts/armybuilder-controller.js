
armybuilderController = function() {
    var armyPage;
    var initialized = false;
    var dataObject;
    var activeArmy;

    function armyData() {
        return armybuilderController.dataObject[armybuilderController.activeArmy];
    }

    // Custom delimiters for jsrender to make compatible with django templates
    $.views.settings.delimiters("{?", "?}");

    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode+':'+errorMessage);
    }

    function updateRendering(units) {
        // Disable button for chosen unique units
        $('#forceList a.unitBtn').removeClass('disabled');
        $.each(units, function(i,unit) {
            if(unit.name.indexOf('[1]') > -1) {
                $('#forceList td:contains('+unit.name+')').parents('tr').find('.unitBtn').addClass('disabled');
            }
        });
        updateStatistics(units);
    }
    
    /* Calculate statistics for unit selections and update info table */
    function updateStatistics(units) {
        var stats = {points: 0, count: 0, Troop: 0, Regiment: 0, Horde: 0, Legion: 0, Hero: 0, Monster: 0, Warengine: 0};
        $.each(units, function(i,unit) {
            if(unit.name.indexOf('*') > -1) {
                stats["Troop"] += 1;
            } else {
                stats[unit.form] += 1;
            }
            stats["count"] += 1;
            stats["points"] += unit.Pts;
        });
        var herOverflow = stats.Hero - stats.Horde - stats.Legion;
        var monOverflow = stats.Monster - stats.Horde - stats.Legion;
        var wenOverflow = stats.Warmachine - stats.Horde - stats.Legion;
        var restSlots = stats.Regiment -
            (herOverflow>0 ? herOverflow : 0) -
            (monOverflow>0 ? monOverflow : 0) -
            (wenOverflow>0 ? wenOverflow : 0);
        stats.slotsTro = (2*stats.Regiment + 4*stats.Horde + 4*stats.Legion) - stats.Troop;
        stats.legalTro = stats.slotsTro >= 0;
        stats.slotsHer = restSlots - (herOverflow<0 ? herOverflow : 0);
        stats.legalHer = stats.slotsHer >= 0;
        stats.slotsMon = restSlots - (monOverflow<0 ? monOverflow : 0);
        stats.legalMon = stats.slotsMon >= 0;
        stats.slotsWen = restSlots - (wenOverflow<0 ? wenOverflow : 0);
        stats.legalWen = stats.slotsWen >= 0;
        stats.legalAllies = "true"; //incomplete
        var statsTmpl = $.templates("#statsTmpl");
        var statsHtml = statsTmpl.render(stats);
        $('#statsTable').html(statsHtml);
        $('#pointsTotal').html(stats.points);
    }

    function getUnitObject(evt) {
        var unit = {};
        unit.key = $(evt.target).data().key;
        unit.form = $(evt.target).data().form;
        unit.stats = armyData()["units"][unit.key][unit.form];
        unit.name = armyData()["units"][unit.key].name;
        return unit;
    }

    function generate_armylist_obj(units) {
        var obj = {};
        obj.player = "Torkel";
        obj.army = "elfarmies";
        obj.name = "My new list";
        //obj.tournament = "";
        obj.pts = 2000;
        obj.units = [];
        $.each(units, function(i,u) {
            var options = "";
            obj.units.push(["elfarmies",u.key,u.form,options]);
        });
        return obj;
    }

    // Helper functions for forceList html template (jsrender)
    var tmplHelper = {
        suffix: function(form) {
            if(jQuery.inArray(form,["Troop","Regiment","Horde","Legion"]) >= 0) {
                return " "+form;
            } else {
                return "";
            }
        }
    }

    return {
        init: function(page, callback) {
            if(initialized) {
                callback("elfarmies");
            } else {
                armyPage = page;

                // Initialize storage engine
                storageEngine.init(function() {
                    storageEngine.initObjectStore('units', function() {
                        callback("elfarmies");
                    }, errorLogger)
                }, errorLogger);

                // Button listener: Remove unit choice
                $(armyPage).find('#choiceList tbody').on('click', '.removeBtn', function(evt) {
                    evt.preventDefault();
                    storageEngine.remove('units', $(evt.target).parents('tr').data().unitId, function(units) {
                        var name = $(evt.target).parents('tr').children().first().text();
                        if(name.indexOf('[1]') > -1) {
                            $('#forceList td:contains('+name+')').parents('tr').find('.unitBtn').removeClass('unique');
                        }
                        $(evt.target).parents('tr').remove();
                        updateRendering(units);
                    }, errorLogger);
                });

                // Button listener: Select Army
                $(armyPage).find('#armyselector').on('click', '.armyBtn', function(evt) {
                    evt.preventDefault();
                });

                // Button listener: Get armylist PDF
                $(armyPage).on('click', '.pdfBtn', function(evt) {
                    evt.preventDefault();
                    var senddata;
                    storageEngine.findAll('units', function(units) {
                        var sendobj = generate_armylist_obj(units);
                        senddata = JSON.stringify(sendobj);
                    }, errorLogger);
                    if(senddata.length < 10) {
                        console.log("Error in senddata, did not request PDF");
                        return;
                    }
                    $.getJSON("pdfgen", senddata, function(response) {
                        pdfurl = "getpdf/" + response.id;
                        window.open(pdfurl);
                    })
                    .done(function(data) {
                    })
                    .fail(function(d, textStatus, error) {
                        console.log("getJSON failed, status: " + textStatus + ", error: " + error);
                    })
                    .always(function() {
                    });
                });

                initialized = true;
            }
        },

        loadForceListJSON: function(armyName) {
            $.getJSON("armydata", function(data) {
                armybuilderController.dataObject = data;
                armybuilderController.activeArmy = armyName;
                // Placeholder setup:
                var forceListTmpl = $.templates("#forceListTmpl");
                var forceListHtml = forceListTmpl.render(armyData());
                $('#forceList').html(forceListHtml);
            })
            .done(function() {
                armybuilderController.loadSelections();
                // forceList button listeners
                $(armyPage).find('#forceList tbody').on('click', '.unitBtn', function(evt) {
                    evt.preventDefault();
                    var obj = getUnitObject(evt);
                    storageEngine.save('units', obj, function() {
                        armybuilderController.loadSelections();
                    }, errorLogger);
                });
            })
            .fail(function() {
                errorLogger("JSON", "getJSON failed to load army data");
            })
            .always(function() {
            });
        },

        loadSelections: function() {
            storageEngine.findAll('units', function(units) {
                var unitChoiceTmpl = $.templates("#unitChoiceTmpl");
                var unitChoiceHtml = unitChoiceTmpl.render(units, tmplHelper);
                $('#choiceListBody').html(unitChoiceHtml);
                updateRendering(units);
            }, errorLogger);
        }
    }
}();

