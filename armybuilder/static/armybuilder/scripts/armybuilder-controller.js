armybuilderController = function() {
    /* Custom delimiters for jsrender to make compatible with django templates */
    $.views.settings.delimiters("{?", "?}");

    var armyPage;
    var initialized = false;
    var activeArmy;
    var dataObj;

    function getArmyData() {
        return armybuilderController.dataObj["armies"];
    }
    function getActiveArmyData() {
        return  armybuilderController.dataObj["armies"][armybuilderController.activeArmy];
    }
    function getSpecialRules() {
        return armybuilderController.dataObj["special"];
    }
    function getItems() {
        return armybuilderController.dataObj["items"];
    }
    function getSpells() {
        return armybuilderController.dataObj["spells"];
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
        var armyChoiceTmpl = $.templates("#armyChoicePanelTmpl");
        var armyChoiceHtml = armyChoiceTmpl.render(armyChoiceList);
        $('#armyChoicePanel').html(armyChoiceHtml);
        var primaryArmyTmpl = $.templates("#primaryArmyTmpl");
        var primaryArmyHtml = primaryArmyTmpl.render(armyChoiceList);
        $('#primaryArmyOptions').html(primaryArmyHtml);
        $(armyPage).find('#forceListHeader').addClass('disabled');
    }

    /* Load the forceList view with unit choices from seleted armySelection */
    function loadUnitChoices(armySelection, armyName) {
        armybuilderController.activeArmy = armySelection;
        var forceListTmpl = $.templates("#forceListTmpl");
        var forceListHtml = forceListTmpl.render(getActiveArmyData(), tmplHelper);
        $('#unitChoicePanel').html(forceListHtml);
        $('#armyChoicePanel').hide();
        $('#unitList').show();
        $('#forceListHeader').find('.forceListReturnBtn>div>div').html(armyName);
        // forceList button listeners
        $(armyPage).find('.forceList tbody').on('click', '.unitBtn', function(evt) {
            evt.preventDefault();
            var obj = getUnitObject(evt);
            storageEngine.save('units', obj, function(data) {
                renderUnitSelections(data);
            }, errorLogger);
        });
        // forceList scroll listener
        $(armyPage).find('.forceList tbody').on('scroll', function(evt) {
            var e = $(evt.target);
            if(e[0].scrollHeight == e.outerHeight()) {
                $('.scroller').hide();
            } else if(e.scrollTop() < 10) {
                $('#topScroll').hide();
                $('#botScroll').show();
            } else if(e[0].scrollHeight - e.scrollTop() < e.outerHeight() + 10) {
                $('#topScroll').show();
                $('#botScroll').hide();
            } else {
                $('.scroller').show();
            }
        });
        $('#unitList tbody').scroll();
        renderUnitChoices();
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
    
    /* Dynamically calculate size of elements in left panel */
    function renderUnitChoices() {
        var $forceList = $('table.forceList');
        var tableWidth = $forceList.width();
        var padding = 12;
        $.each($forceList, function(i,table) {
            var btnWidth = $(table).find('tbody .unitName').siblings().first().width();
            var btnCount = $(table).find('.unitName').first().siblings().length;
            var unitNameWidth = tableWidth - (btnCount*btnWidth) - padding;
            $(table).find('th.unitName').siblings().width(btnWidth);
            $(table).find('.unitName').width(unitNameWidth);
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
        $('.forceList a.unitBtn').removeClass('disabled');
        var armyData = getArmyData();
        $.each(units, function(i,unit) {
            var unitData = armyData[unit.army]['units'][unit.key];
            unit.name = unitData['name'];
            unit.stats = unitData[unit.form];
            // Disable button for chosen unique units
            if(unit.name.indexOf('[1]') > -1) {
                $('.forceList td:contains('+unit.name+')').parents('tr').find('.unitBtn').addClass('disabled');
            }
        });
        // Set armylist title, primary army, and points limit
        $(armyPage).find('#armylistTitle>div').html(armyList.meta.name);
        $(armyPage).find('#primaryArmyBtn').html(armyData[armyList.meta.army].name);
        $(armyPage).find('#armylistPoints').html(armyList.meta.pts+" Points");
        // Render armylist
        var unitChoiceTmpl = $.templates("#unitChoiceTmpl");
        var unitChoiceHtml = unitChoiceTmpl.render(units, tmplHelper);
        $('#choiceListBody').html(unitChoiceHtml);
        // Render statistics
        var stats = calculateStatistics(armyList);
        var statsTmpl = $.templates("#statsTmpl");
        var statsHtml = statsTmpl.render(stats);
        $('#statsTable').html(statsHtml);
        // Set total points value
        $('#pointsTotal').html(stats.points);
    }
    
    /* Calculate statistics for unit selections and update info table */
    function calculateStatistics(armyList) {
        var primaryArmy = armyList.meta.army;
        var units = armyList.items;
        var stats = {points: 0, allies: 0, count: 0, Troop: 0, Regiment: 0, Horde: 0, Legion: 0, Hero: 0, Monster: 0, Warengine: 0};
        $.each(units, function(i,unit) {
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
        stats.pointsLimit = armyList.meta.pts;
        stats.legalPts = stats.points <= stats.pointsLimit;
        return stats;
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
        var armyData = getArmyData();
        $.each(armyList.items, function(i,unit) {
            var unitData = armyData[unit.army]['units'][unit.key];
            unit.name = unitData.name;
            unit.stats = unitData[unit.form];
        });
        var stats = calculateStatistics(armyList);
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
        suffix: function(form) { return $.inArray(form,["Troop","Regiment","Horde","Legion"]) >= 0 ? " "+form : ""; },
        isUnit: function(u) { return (u.Troop || u.Regiment || u.Horde || u.Legion) },
        isMon: function(u) { return (u.Monster || u.Warengine) },
        isHero: function(u) { return (u.Hero) }
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

                // Button listener: Move to army selection view */
                $(armyPage).find('#forceListHeader').on('click', '.forceListReturnBtn', function(evt) {
                    evt.preventDefault();
                    $(armyPage).find('#forceListHeader').addClass('disabled');
                    $(armyPage).find('#unitChoicePanel').children().hide();
                    $(armyPage).find('#armyChoicePanel').show();
                    $(armyPage).find('.forceListReturnBtn>div>div').html('Select an army');
                });

                // Button listener: Select army to view choices for
                $(armyPage).find('#armyChoicePanel').on('click', '.armyBtn', function(evt) {
                    evt.preventDefault();
                    var $tar = $(evt.target).closest('.armyBtn');
                    var armyKey = $tar.data().army;
                    var armyName = $tar.find('div>div').html();
                    loadUnitChoices(armyKey, armyName);
                    $(armyPage).find('#forceListHeader').removeClass('disabled');
                });
                
                // Button listener: Select section of current army (units/monsters/heroes)
                $(armyPage).find('#forceListHeader').on('click', '.forceSectionBtn', function(evt) {
                    evt.preventDefault();
                    var $sections = $(armyPage).find('#unitChoicePanel');
                    $sections.children().hide();
                    var sectionChoice = $(evt.target).closest('.forceSectionBtn').data().section;
                    $sections.find('#'+sectionChoice).show();
                    $sections.find('#'+sectionChoice+' tbody').scroll();
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
                        var pdfurl = "getpdf/" + response.id;
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
            $.getJSON("dataobj", function(data) {
                $.each(data["armies"], function(i,v) {
                    v.key = i;
                });
                armybuilderController.dataObj = data;
            })
            .done(function(data) {
                loadUnitSelections();
                loadArmyChoices(data["armies"]);
            })
            .fail(function() {
                errorLogger("JSON", "getJSON failed to load army data");
            })
            .always(function() {
            });
        }
    }
}();

