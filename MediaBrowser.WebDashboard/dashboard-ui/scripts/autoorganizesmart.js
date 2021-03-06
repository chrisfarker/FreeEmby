﻿define(['jQuery', 'listViewStyle'], function ($) {

    var query = {

        StartIndex: 0,
        Limit: 100000
    };

    var currentResult;

    function reloadList(page) {

        Dashboard.showLoadingMsg();

        ApiClient.getSmartMatchInfos(query).then(function (infos) {

            currentResult = infos;

            populateList(page, infos);

            Dashboard.hideLoadingMsg();

        }, function () {

            Dashboard.hideLoadingMsg();
        });
    }

    function populateList(page, result) {

        var infos = result.Items;

        if (infos.length > 0) {
            infos = infos.sort(function (a, b) {

                a = a.OrganizerType + " " + (a.DisplayName || a.ItemName);
                b = b.OrganizerType + " " + (b.DisplayName || b.ItemName);

                if (a == b) {
                    return 0;
                }

                if (a < b) {
                    return -1;
                }

                return 1;
            });
        }

        var html = "";

        if (infos.length) {
            html += '<div class="paperList">';
        }

        for (var i = 0, length = infos.length; i < length; i++) {

            var info = infos[i];

            html += '<div class="listItem">';

            html += '<i class="listItemIcon md-icon">folder</i>';

            html += (info.DisplayName || info.ItemName);

            html += '</div>';

            var matchStringIndex = 0;

            html += info.MatchStrings.map(function (m) {

                var matchStringHtml = '';
                matchStringHtml += '<div class="listItem">';

                matchStringHtml += '<div class="listItemBody">';

                matchStringHtml += "<div class='listItemBodyText secondary'>" + m + "</div>";

                matchStringHtml += '</div>';

                matchStringHtml += '<button type="button" is="paper-icon-button-light" class="btnDeleteMatchEntry" data-index="' + i + '" data-matchindex="' + matchStringIndex + '" title="' + Globalize.translate('ButtonDelete') + '"><i class="md-icon">delete</i></button>';

                matchStringHtml += '</div>';
                matchStringIndex++;

                return matchStringHtml;

            }).join('');
        }

        if (infos.length) {
            html += "</div>";
        }

        $('.divMatchInfos', page).html(html);
    }

    function getTabs() {
        return [
        {
            href: 'autoorganizelog.html',
            name: Globalize.translate('TabActivityLog')
        },
         {
             href: 'autoorganizetv.html',
             name: Globalize.translate('TabTV')
         },
         {
             href: 'autoorganizesmart.html',
             name: Globalize.translate('TabSmartMatches')
         }];
    }

    $(document).on('pageinit', "#libraryFileOrganizerSmartMatchPage", function () {

        var page = this;

        $('.divMatchInfos', page).on('click', '.btnDeleteMatchEntry', function () {

            var button = this;
            var index = parseInt(button.getAttribute('data-index'));
            var matchIndex = parseInt(button.getAttribute('data-matchindex'));

            var info = currentResult.Items[index];
            var entries = [
            {
                Name: info.ItemName,
                Value: info.MatchStrings[matchIndex]
            }];

            ApiClient.deleteSmartMatchEntries(entries).then(function () {

                reloadList(page);

            }, Dashboard.processErrorResponse);

        });

    }).on('pageshow', "#libraryFileOrganizerSmartMatchPage", function () {

        var page = this;

        LibraryMenu.setTabs('autoorganize', 2, getTabs);

        Dashboard.showLoadingMsg();

        reloadList(page);

    }).on('pagebeforehide', "#libraryFileOrganizerSmartMatchPage", function () {

        var page = this;
        currentResult = null;
    });

});