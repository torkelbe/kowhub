armybuilderController = function() {
    /* Custom delimiters for jsrender to make compatible with django templates */
    $.views.settings.delimiters("{?", "?}");

    var armyPage;
    var initialized = false;
    var dataObject;
    var activeArmy;

    function getArmyData() {
        return armybuilderController.dataObject;
    }
    function getActiveArmyData() {
        return  armybuilderController.dataObject[armybuilderController.activeArmy];
    }
    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode+':'+errorMessage);
    }

    /* Load buttons for selecting which army to handle */
    function loadArmyChoices(data) {
        var armyChoiceList = [];
        $.each(data, function(key, army) {
            armyChoiceList.push({"key":key,"name":army["name"]});
        });
        var armyChoiceTmpl = $.templates("#armyChoiceTmpl");
        var armyChoiceHtml = armyChoiceTmpl.render(armyChoiceList);
        $('#armyselector').html(armyChoiceHtml);
    }

    /* Load the forceList view with unit choices from seleted armySelection */
    function loadUnitChoices(armySelection) {
        armybuilderController.activeArmy = armySelection;
        var forceListTmpl = $.templates("#forceListTmpl");
        var forceListHtml = forceListTmpl.render(getActiveArmyData());
        $('#forceList').html(forceListHtml);
        // forceList button listeners
        $(armyPage).find('#forceList tbody').on('click', '.unitBtn', function(evt) {
            evt.preventDefault();
            var obj = getUnitObject(evt);
            storageEngine.save('units', obj, function(data) {
                renderUnitSelections(data);
            }, errorLogger);
        });
    }

    /* Load the set of unit selections from local webstorage */
    function loadUnitSelections() {
        storageEngine.findAll('units', function(data) {
            renderUnitSelections(data);
        }, errorLogger);
    }

    /* Adjust application view when unit selections change */
    function renderUnitSelections(armyList) {
        units = armyList.items;
        $('#forceList a.unitBtn').removeClass('disabled');
        var armyData = getArmyData();
        $.each(units, function(i,unit) {
            var unitData = armyData[unit.army]['units'][unit.key];
            unit.name = unitData['name'];
            unit.stats = unitData[unit.form];
            // Disable button for chosen unique units
            if(unit.name.indexOf('[1]') > -1) {
                $('#forceList td:contains('+unit.name+')').parents('tr').find('.unitBtn').addClass('disabled');
            }
        });
        var unitChoiceTmpl = $.templates("#unitChoiceTmpl");
        var unitChoiceHtml = unitChoiceTmpl.render(units, tmplHelper);
        $('#choiceListBody').html(unitChoiceHtml);
        updateStatistics(units);
    }
    
    /* Calculate statistics for unit selections and update info table */
    function updateStatistics(units) {
        var stats = {points: 0, count: 0, Troop: 0, Regiment: 0, Horde: 0, Legion: 0, Hero: 0, Monster: 0, Warengine: 0};
        $.each(units, function(i,unit) {
            if(unit.name.indexOf('*') > -1) {
                stats['Troop'] += 1;
            } else {
                stats[unit.form] += 1;
            }
            stats['count'] += 1;
            stats['points'] += unit['stats'].Pts;
        });
        var herOverflow = stats.Hero - stats.Horde - stats.Legion;
        var monOverflow = stats.Monster - stats.Horde - stats.Legion;
        var wenOverflow = stats.Warengine - stats.Horde - stats.Legion;
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

    /* Create a unit object based on the information in a unit choice button click */
    function getUnitObject(evt) {
        var unit = {};
        unit.army = $(evt.target).parents('table').data().army;
        unit.key = $(evt.target).data().key;
        unit.form = $(evt.target).data().form;
        unit.options = "";
        return unit;
    }

    /* Configure armylist data for communication with server */
    function generate_armylist_obj(armyList) {
        units = armyList.items;
        var obj = {};
        obj.player = "Torkel";
        obj.army = "elfarmies";
        obj.name = "My new list";
        //obj.tournament = "";
        obj.pts = 2000;
        obj.units = [];
        $.each(units, function(i,u) {
            obj.units.push([u.army,u.key,u.form,u.options]);
        });
        return obj;
    }

    /* Helper functions for forceList html template (jsrender) */
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
                callback();
            } else {
                armyPage = page;

                // Initialize storage engine
                storageEngine.init(function() {
                    storageEngine.initObjectStore('units', function() {
                        callback();
                    }, errorLogger)
                }, errorLogger);

                // Button listener: Remove unit choice
                $(armyPage).find('#choiceList tbody').on('click', '.removeBtn', function(evt) {
                    evt.preventDefault();
                    storageEngine.remove('units', $(evt.target).parents('tr').data().unitId, function(data) {
                        renderUnitSelections(data);
                    }, errorLogger);
                });

                // Button listener: Select Army
                $(armyPage).find('#armyselector').on('click', '.armyBtn', function(evt) {
                    evt.preventDefault();
                    var armyChoice = $(evt.target).data().armyKey;
                    loadUnitChoices(armyChoice);
                });

                // Button listener: Get armylist PDF
                $(armyPage).on('click', '.pdfBtn', function(evt) {
                    evt.preventDefault();
                    var senddata;
                    storageEngine.findAll('units', function(data) {
                        var sendobj = generate_armylist_obj(data);
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

        loadForceListJSON: function() {
            $.getJSON("armydata", function(data) {
                $.each(data, function(i,v) {
                    v.key = i;
                });
                armybuilderController.dataObject = data;
            })
            .done(function(data) {
                loadUnitSelections();
                loadArmyChoices(data);
                //loadUnitChoices("elfarmies");
            })
            .fail(function() {
                errorLogger("JSON", "getJSON failed to load army data");
            })
            .always(function() {
            });
        }
    }
}();

