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
        var primaryArmyTmpl = $.templates("#primaryArmyTmpl");
        var primaryArmyHtml = primaryArmyTmpl.render(armyChoiceList);
        $('#primaryArmyOptions').html(primaryArmyHtml);
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
        loadUnitSelections();
    }

    /* Load the set of unit selections from local webstorage */
    function loadUnitSelections() {
        storageEngine.findAll('units', function(data) {
            renderUnitSelections(data);
        }, errorLogger);
    }

    /* Button listener: Change name of armylist */
    function buttonListenerArmylistName() {
        $(armyPage).find('#armylistTitle').on('click', function(evt) {
            evt.preventDefault();
            var func = 'armybuilderController.changeArmyListTitle';
            var value = $(evt.target).html();
            var inputTmpl = $.templates('#listTitleTmpl');
            var inputHtml = inputTmpl.render({'value':value, 'func':func});
            $(evt.target).parents('caption').html(inputHtml);
            $(armyPage).find('#titleChange').select();
        });
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
        // Set primary army
        $('.armyChoice').html(armyData[armyList.meta.army].name);
        // Set armylist title
        $('#armylistTitle').html(armyList.meta.name);
        // Set armylist
        var unitChoiceTmpl = $.templates("#unitChoiceTmpl");
        var unitChoiceHtml = unitChoiceTmpl.render(units, tmplHelper);
        $('#choiceListBody').html(unitChoiceHtml);
        updateStatistics(units, armyList.meta.army);
    }
    
    /* Calculate statistics for unit selections and update info table */
    function updateStatistics(units, army) {
        var stats = {points: 0, allies: 0, count: 0, Troop: 0, Regiment: 0, Horde: 0, Legion: 0, Hero: 0, Monster: 0, Warengine: 0};
        $.each(units, function(i,unit) {
            if(unit.name.indexOf('*') > -1) {
                stats['Troop'] += 1;
            } else {
                stats[unit.form] += 1;
            }
            stats['count'] += 1;
            stats['points'] += unit['stats'].Pts;
            if(unit.army != army) {
                stats.allies += unit.stats.Pts;
            }
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
        stats.allies = Math.ceil(100 * stats.allies / (stats.points+1));
        stats.legalAllies = stats.allies <= 25;
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
        var obj = {'player':'Orcy','army':'Not specified','name':'New Army List','pts':2000}; // default values
        $.extend(obj, armyList.meta);
        obj.units = [];
        $.each(armyList.items, function(i,u) {
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

                // Button listener: Select army to view choices for
                $(armyPage).find('#armyselector').on('click', '.armyBtn', function(evt) {
                    evt.preventDefault();
                    var armyChoice = $(evt.target).data().army;
                    loadUnitChoices(armyChoice);
                });

                // Button listener: Display drop-down menu for selecting primary army
                $(armyPage).find('#armylistDetails').on('click', '.armyChoice', function(evt) {
                    evt.preventDefault();
                    var options = $('.armyOptions');
                    options.toggleClass('active');
                    options.slideToggle(200);
                });

                // Button listener: Select primary army from drop-down menu
                $(armyPage).find('#armylistDetails').on('click', '.armyOptions', function(evt) {
                    evt.preventDefault();
                    var tar = $(evt.target).closest('li').children('a');
                    var meta = {'army':tar.data().army};
                    storageEngine.setMeta('units', meta, function(data) {
                        $('.armyChoice').click();
                        renderUnitSelections(data);
                    }, errorLogger);
                });

                // Button listener: Change name of armylist
                buttonListenerArmylistName();

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

        changeArmyListTitle: function() {
            var caption = $('#titleChange').parents('caption');
            var title = $('#titleChange').val();
            if(title.length<1) {
                title = $('#titleChange').data().oldValue;
            }
            var meta = {'name':title};
            storageEngine.setMeta('units', meta, function() {}, function() {
                errorLogger(errorCode, errorMessage);
                title = $('#titleChange').data().oldValue;
            });
            var newCaptionHtml = '<span id="armylistTitle">'+title+'</span>';
            caption.html(newCaptionHtml);
            buttonListenerArmylistName();
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

