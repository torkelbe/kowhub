armybuilderController = function() {
    /* Custom delimiters for jsrender to make compatible with django templates */
    $.views.settings.delimiters("{?", "?}");

    var armyPage;
    var initialized = false;
    var dataObj;

    function getArmyData() {
        return armybuilderController.dataObj["armies"];
    }
    function getOrderedArmyData(armySelection) {
        var data = armybuilderController.dataObj["armies"][armySelection];
        var orderedUnits = {};
        $.each(data.units, function(key, unit) {
            orderedUnits[unit.order] = unit;
        });
        return {"units": orderedUnits};
    }
    function getSpecialRules() {
        return armybuilderController.dataObj["special"];
    }
    function getItems() {
        return armybuilderController.dataObj["items"];
    }
    function getRanged() {
        return armybuilderController.dataObj["ranged"];
    }
    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode+':'+errorMessage);
    }
    function getStatsObj(s) {
        return {"Sp":s[0],"Me":s[1],"Ra":s[2],"De":s[3],"Att":s[4],"Ne":s[5],"Pts":s[6]}
    }

    jQuery.fn.showV = function() {
        this.css('visibility', 'visible');
    }
    jQuery.fn.hideV = function() {
        this.css('visibility', 'hidden');
    }

    /* Helper structure to avoid firing multiple identical events within the 500ms delay */
    var waitForFinalEvent = (function() {
        var timers = {};
        return function (callback, ms, uniqueId) {
            if (!uniqueId) {
                uniqueId = "default uniqueId";
            }
            if (timers[uniqueId]) {
                clearTimeout(timers[uniqueId]);
            }
            timers[uniqueId] = setTimeout(callback, ms);
        };
    })();

    /* Load buttons for selecting which army to handle */
    function loadArmyOptions(data) {
        var armyOptions = [];
        $.each(data, function(key, army) {
            armyOptions.push({"order":army.order,"key":key,"name":army.name});
        });
        armyOptions.sort(function(a,b) {
            if (a.order < b.order) { return -1 }
            if (a.order > b.order) { return 1 }
            return 0;
        });
        var armyOptionsTmpl = $.templates("#armyOptionsTmpl");
        var armyOptionsHtml = armyOptionsTmpl.render(armyOptions);
        $('#armyOptions').html(armyOptionsHtml);
        // Add invisible elements for layout purposes
        for (i = 0; i < 5-(armyOptions.length%5); i++) {
            $('#armyOptions').append('<div style="visibility:hidden;"></div>');
        }
        var primaryArmyTmpl = $.templates("#primaryArmyTmpl");
        var primaryArmyHtml = primaryArmyTmpl.render(armyOptions);
        $('#primaryArmyOptions').html(primaryArmyHtml);
        $(armyPage).find('#forceListHeader').addClass('disabled');
        $(armyPage).find('#unitOptions').hide();
    }

    /* Load the forceList view with unit choices from seleted armySelection */
    function loadUnitOptions(armySelection, armyName) {
        var unitOptionsTmpl = $.templates("#unitOptionsTmpl");
        var unitOptionsHtml = unitOptionsTmpl.render(getOrderedArmyData(armySelection), tmplHelper);
        $('#unitOptions').html(unitOptionsHtml);
        $('#armyOptions').hide();
        $('#unitOptions').show();
        $('#unitOptions').scrollTop(0);
        $('#forceListHeader').find('.forceListReturnBtn>div>div').html(armyName);
        // Unit option button listeners
        $(armyPage).find('#unitOptions nav').on('click', 'div', function(evt) {
            evt.preventDefault();
            var obj = getUnitObject(evt);
            storageEngine.addUnit('units', obj, function(data) {
                renderUnitSelections(data);
                var panel = $('#armylistPanel section')[0];
                $(panel).scrollTop(panel.scrollHeight);
            }, errorLogger);
        });
        // Rerender unit selections
        loadUnitSelections();
    }

    /* Apply change in armylist title */
    function changeArmyListTitle() {
        var $div = $(armyPage).find('#armylistTitle>div');
        var $txt = $(armyPage).find('#armylistTitle>textarea');
        var title = $txt.val();
        if(title.length > 0) {
            var meta = {'name':title};
            storageEngine.setMeta('units', meta, function() {
                $div.html(title);
            }, function() {
                errorLogger(errorCode, errorMessage);
            });
        }
        $txt.hide();
        $div.show();
    }

    /* Load the set of unit selections from local webstorage */
    function loadUnitSelections() {
        storageEngine.getList('units', function(data) {
            try {
                renderUnitSelections(data);
            }
            catch(err) {
                // Fix to prevent app crash during development as data format and IDs change
                var meta;
                storageEngine.removeList('units', function(data){
                    console.log("Error in data format of stored army list. Data has been reset.");
                    meta = {'player':data.meta.player,'name':data.meta.name,'pts':data.meta.pts};
                }, errorLogger);
                storageEngine.initList('units', function(data){
                    storageEngine.setMeta('units', meta, function(data){
                        renderUnitSelections(data);
                    }, errorLogger);
                }, errorLogger);
            }
        }, errorLogger);
    }

    /* Adjust application view when unit selections change */
    function renderUnitSelections(armylist) {
        var default_values = {'player':'Orcy','army':'el','name':'New Army List','pts':2000};
        armylist.meta = $.extend(default_values, armylist.meta);
        $('#unitOptions nav>div').removeClass('disabled');
        var armyData = getArmyData();
        $.each(armylist.units, function(i,unit) {
            unit.army = unit.key.substr(0,2);
            var unitData = armyData[unit.army]['units'][unit.key];
            unit.name = unitData['name'];
            unit.stats = unitData[unit.form];
            unit.type = unitData['type'];
            // Disable button for chosen unique units
            if(unit.name.indexOf('[1]') > -1) {
                $('#unitOptions nav>label:contains('+unit.name+')').siblings().addClass('disabled');
            }
        });
        // Set armylist title, primary army, and points limit
        $(armyPage).find('#armylistTitle>div').html(armylist.meta.name);
        $(armyPage).find('#primaryArmyBtn').html(armyData[armylist.meta.army].name);
        $(armyPage).find('#armylistPoints').html(armylist.meta.pts+" Points");
        // Render armylist
        var unitTmpl = $.templates("#armylistUnitTmpl");
        var unitsHtml = unitTmpl.render(armylist.units, tmplHelper);
        $('#armylistPanel>section').html(unitsHtml);
        // Render statistics
        var stats = calculateStatistics(armylist);
        var statsTmpl = $.templates("#statsTmpl");
        var statsHtml = statsTmpl.render(stats);
        $('#statsTable').html(statsHtml);
        // Set total points value
        $('#pointsTotal').html(stats.points);
    }
    
    /* Calculate statistics for unit selections and update info table */
    function calculateStatistics(armylist) {
        var primaryArmy = armylist.meta.army;
        var stats = {points: 0, allies: 0, count: 0, Troop: 0, Regiment: 0, Horde: 0, Legion: 0, Hero: 0, Monster: 0, Warengine: 0};
        $.each(armylist.units, function(i,unit) {
            if(unit.name.indexOf('*') > -1) {
                stats['Troop'] += 1;
            } else {
                stats[unit.form] += 1;
            }
            stats['count'] += 1;
            stats['points'] += unit['stats'].Pts;
            if(unit.army != primaryArmy) {
                stats.allies += unit.stats.Pts;
            }
        });
        var herOverflow = stats.Hero - stats.Horde - stats.Legion;
        var monOverflow = stats.Monster - stats.Horde - stats.Legion;
        var wenOverflow = stats.Warengine - stats.Horde - stats.Legion;
        var restSlots = stats.Regiment - (herOverflow>0 ? herOverflow : 0) - (monOverflow>0 ? monOverflow : 0) - (wenOverflow>0 ? wenOverflow : 0);
        stats.slotsTro = (2*stats.Regiment + 4*stats.Horde + 4*stats.Legion) - stats.Troop;
        stats.legalTro = stats.slotsTro >= 0;
        stats.slotsHer = restSlots - (herOverflow<0 ? herOverflow : 0);
        stats.legalHer = stats.Hero > 0 ? stats.slotsHer >= 0 : true;
        stats.slotsMon = restSlots - (monOverflow<0 ? monOverflow : 0);
        stats.legalMon = stats.Monster > 0 ? stats.slotsMon >= 0 : true;
        stats.slotsWen = restSlots - (wenOverflow<0 ? wenOverflow : 0);
        stats.legalWen = stats.Warengine > 0 ? stats.slotsWen >= 0 : true;
        stats.allies = Math.ceil(100 * stats.allies / (stats.points+1));
        stats.legalAllies = stats.allies <= 25;
        stats.pointsLimit = armylist.meta.pts;
        stats.legalPts = stats.points <= stats.pointsLimit;
        return stats;
    }

    /* Create a unit object based on the information in a unit choice button click */
    function getUnitObject(evt) {
        var unit = {};
        unit.key = $(evt.target).data().key;
        unit.form = $(evt.target).data().form;
        unit.options = "";
        return unit;
    }

    /* Configure armylist data for communication with server */
    function generate_armylist_obj(armylist) {
        var obj = {'player':'Orcy','army':'Not specified','name':'New Army List','pts':2000}; // default values
        $.extend(obj, armylist.meta);
        obj.units = [];
        $.each(armylist.units, function(i,u) {
            obj.units.push([u.army,u.key,u.form,u.options]);
        });
        var armyData = getArmyData();
        $.each(armylist.units, function(i,unit) {
            var unitData = armyData[unit.army]['units'][unit.key];
            unit.name = unitData.name;
            unit.stats = unitData[unit.form];
        });
        var stats = calculateStatistics(armylist);
        obj.legal = true;
        $.each(stats, function(i,v) {
            if(i.indexOf('legal') > -1) {
                if(!v) obj.legal = false;
            }
        });
        return obj;
    }

    /* Helper functions for forceList html template (jsrender) */
    var tmplHelper = {
        isUnit: function(u) { return (u.Troop || u.Regiment || u.Horde || u.Legion) },
        isWen: function(u) { return (u.Warengine) },
        isMon: function(u) { return (u.Monster) },
        isHero: function(u) { return (u.Hero) },
        hasWen: function(units) {
            var retval = false;
            $.each(units, function(i,u) {
                if (u.Warengine) { retval = true; return false; }
            });
            return retval;
        },
        hasMon: function(units) {
            var retval = false;
            $.each(units, function(i,u) {
                if (u.Monster) { retval = true; return true; }
            });
            return retval;
        },
        typeFormat: function(form) {
            if(form==="Monster" || form==="War Engine") {
                return "";
            } else {
                return (
                    {"Infantry":" (Inf)",
                    "Large Infantry":" (Lrg Inf)",
                    "Cavalry":" (Cav)",
                    "Large Cavalry":" (Lrg Cav)",
                    "Monster":" (Mon)",
                    "War Engine":" (War Eng)"}
                    )[form];
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
                    storageEngine.initList('units', function() {
                        callback();
                    }, errorLogger)
                }, errorLogger);

                // Button listener: Remove unit choice
                $(armyPage).find('#armylistPanel').on('click', '.alUnitBtnRm', function(evt) {
                    evt.preventDefault();
                    storageEngine.removeUnit('units', $(evt.target).parents('.alUnit').data().unitId, function(data) {
                        renderUnitSelections(data);
                    }, errorLogger);
                });

                // Button listener: Move to army selection view */
                $(armyPage).find('#forceListHeader').on('click', '.forceListReturnBtn', function(evt) {
                    evt.preventDefault();
                    $(armyPage).find('#forceListHeader').addClass('disabled');
                    $(armyPage).find('#unitOptions').hide();
                    $(armyPage).find('#armyOptions').show();
                    $(armyPage).find('.forceListReturnBtn>div>div').html('Select an army');
                });

                // Button listener: Select army to view options for
                $(armyPage).find('#armyOptions').on('click', 'div', function(evt) {
                    evt.preventDefault();
                    var armyKey = $(evt.target).data().army;
                    var armyName = $(evt.target).html();
                    loadUnitOptions(armyKey, armyName);
                    $(armyPage).find('#forceListHeader').removeClass('disabled');
                });

                // Button listener: Display drop-down menus
                $(armyPage).on('click', '.dropdownBtn', function(evt) {
                    evt.preventDefault();
                    $(evt.target).closest('.dropdownBtn').siblings('.dropdownMenu').slideToggle(200);
                });
                $(armyPage).on('blur', '.dropdownBtn', function(evt) {
                    $(evt.target).closest('.dropdownBtn').siblings('.dropdownMenu').delay(100).slideUp(200);
                });

                // Button listener: Select primary army from drop-down menu
                $(armyPage).on('click', '#primaryArmyOptions', function(evt) {
                    evt.preventDefault();
                    var $tar = $(evt.target).closest('li').children('a');
                    var meta = {'army':$tar.data().army};
                    storageEngine.setMeta('units', meta, function(data) {
                        $tar.closest('.dropdownMenu').slideUp(200);
                        renderUnitSelections(data);
                    }, errorLogger);
                });

                // Button listener: Select points limit from drop-down menu
                $(armyPage).on('click', '#armylistPointsOptions', function(evt) {
                    evt.preventDefault();
                    var $tar = $(evt.target).closest('li').children('a');
                    var meta = {'pts':$tar.html()};
                    storageEngine.setMeta('units', meta, function(data) {
                        $tar.closest('.dropdownMenu').slideUp(200);
                        renderUnitSelections(data);
                    }, errorLogger);
                });

                // Button listeners: Change name of armylist
                $(armyPage).on('click', '#armylistTitle', function(evt) {
                    evt.preventDefault();
                    var $div = $(evt.target);
                    var $txt = $div.siblings();
                    var title = $div.html();
                    $div.hide();
                    $txt.show();
                    $txt.html(title);
                    $txt.select();
                });
                $(armyPage).on('blur', '#armylistTitle>textarea', function(evt) {
                    evt.preventDefault();
                    changeArmyListTitle();
                });
                $(armyPage).on('keydown', '#armylistTitle>textarea', function(evt) {
                    if(evt.keyCode === 13 || evt.keyCode === 27) { // esc: 27, enter: 13
                        evt.preventDefault();
                        changeArmyListTitle();
                    }
                });

                // Button listener: Get armylist PDF
                $('body').on('click', '.pdfBtn', function(evt) {
                    evt.preventDefault();
                    $(evt.target).addClass('disabled');
                    var $tooltip = $(evt.target).siblings('.riseTooltip');
                    if(true) {
                        $tooltip.html("PDF generation is not yet enabled.");
                    } else { // PDF generation not yet implemented
                        var senddata, sendobj;
                        storageEngine.getList('units', function(data) {
                            sendobj = generate_armylist_obj(data);
                            senddata = JSON.stringify(sendobj);
                        }, errorLogger);
                        if(sendobj.units.length > 0) {
                            $.getJSON("pdfgen", senddata, function(response) {
                                var pdfurl = "getpdf/" + response.id;
                                window.open(pdfurl);
                            })
                            .done(function(data) {
                                $tooltip.html("PDF successful");
                            })
                            .fail(function(d, textStatus, error) {
                                $tooltip.html("Armylist PDF generator failed. Please try again, or notify admin.");
                            })
                            .always(function() {
                            });
                        } else {
                            $tooltip.html("Empty armylist. PDF not requested");
                        }
                    }
                    $tooltip.slideDown(200).delay(2000).slideUp(200);
                    $(evt.target).delay(2400).queue(function(next) {
                        $(this).removeClass('disabled');
                        $tooltip.html("");
                        next();
                    });
                });

                $(window).resize();

                initialized = true;
            }
        },

        loadForceListJSON: function() {
            $.getJSON("dataobj", function(data) {
                $.each(data["armies"], function(armykey, army) {
                    army.key = armykey;
                    $.each(army.units, function(unitkey, unit) {
                        unit.key = unitkey;
                        $.each(["Troop","Regiment","Horde","Legion","Warengine","Monster","Hero"], function(i,form) {
                            if(unit[form]) unit[form] = getStatsObj(unit[form]);
                        });
                    });
                });
                armybuilderController.dataObj = data;
            })
            .done(function(data) {
                loadUnitSelections();
                loadArmyOptions(data["armies"]);
            })
            .fail(function() {
                errorLogger("JSON", "getJSON failed to load army data");
            })
            .always(function() {
            });
        }
    }
}();

$(document).ready(function() {
    armybuilderController.init($('#armybuilderPage'), function(army) {
            armybuilderController.loadForceListJSON();
    });
});

