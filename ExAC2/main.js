(function(){
    var data = [
        {
            id: 1,
            parent_id: null,
            title: 'Result 1'
        }
    ];
    $(function(){
        $('.ExtAC-main').ExtAC2({
            transport: {
                model: {
                    id_field: 'id',
                    parent_id_field: 'parent_id',
                    text_field: 'title'
                },
                read: {
                    url: 'dropdown_data.json'
                }
            }
        });
    });
})();