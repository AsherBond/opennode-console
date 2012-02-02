Ext.define('Onc.tabs.VmMapTab', {
    extend: 'Onc.tabs.Tab',
    alias: 'widget.computevmmaptab',
    requires: 'Ext.util.MixedCollection',

    layout: 'fit',

    initComponent: function() {
        this.items = [{
            xtype: 'gridpanel',
            hideHeaders: true,
            columnLines: true,
            id: 'vmmap',
            store: 'PhysicalComputesStore',

            dockedItems: [
                {xtype: 'toolbar',
                itemId: 'toolbar',
                items: [{
                    iconCls: 'icon-resize',
                    itemId: 'resize',
                    text: 'Resize',
                    disabled: true,
                    scope: this,
                    handler: this.onResizeClick
                }, {
                    iconCls: 'icon-group',
                    itemId: 'group',
                    text: 'Group',
                    disabled: true,
                    scope: this,
                    handler: this.onGroupClick
                }, {
                    iconCls: 'icon-migrate',
                    itemId: 'migrate',
                    text: 'Migrate',
                    scope: this,
                    handler: this.onMigrateClick
                }]}
            ],

            columns: [
                {header: 'Name', dataIndex: 'hostname', width: 100},
                //{header: 'Disk pool size', dataIndex: 'diskspace', width: 15},
                {header: 'Map', dataIndex: 'memory_usage', flex: 1,
                    renderer: function(totalMemory, meta, rec) {
                        var freeMemory = totalMemory,
                            vms = rec.getChild('vms').children(),
                            vm_list = "";

                        vms.each( function(vm) {
                            var memory = vm.get('memory'),
                                width = parseInt(200 * (memory / totalMemory));
                            freeMemory -= memory;
                            vm_list += ['<div class="node-cell" id="vmmap-' + vm.get('id') + '"',
                                ' style="min-width:' + width + 'px">',
                                '<div class="name">' + vm.get('hostname') + '</div>',
                                //'<div class="name">' + vm.get('ipv4_address') + '</div>',
                                '<div class="mem">' + parseInt(memory) + '</div>',
                                '<span class="uptime">' + this.getUptime(vm) + '</span>',
                                '<span class="cores">' + vm.get('num_cores') + '</span>',
                                '</div>'].join('\n');
                        }, this);

                        if (freeMemory) {
                            var width = parseInt(200 * (freeMemory / totalMemory));
                            vm_list += ['<div class="node-cell free" style="min-width:"' + width + 'px">',
                                '<div class="name">free</div>',
                                '<div class="mem">' + parseInt(freeMemory) + '</div>',
                                '</div>'].join('\n');
                        }

                        return vm_list;
                    }
                }
            ],

            getUptime: function(rec) {
                if (rec.get('state') === 'inactive')
                    return 'inactive';
                var timestamp = new Date(Date.parse(rec.get('startup_timestamp')));

                var s = Math.round((+(new Date()) - +timestamp) / 1000);

                var days = Math.floor(s / 86400);
                s -= days * 86400;

                var hours = Math.floor(s / 3600);

                return '' + days + 'd ' + (hours ? (hours + 'h ') : '');
            }
        }];

        this.selectedCells = Ext.create('Ext.util.MixedCollection');

        this.callParent(arguments);
    },

    afterRender: function() {
        var me = this,
            vmmap = Ext.getCmp('vmmap');

        me.callParent(arguments);

        me.mon(vmmap.getStore(), {
            scope: me,
            update: me.updateCell
        });
        me.mon(vmmap.getEl(), 'click', me.onMouseClick, me);
    },

    updateCell: function(store, rec, action) {
        if (action === 'edit') {
            var el = Ext.get('vmmap-' + rec.get('id'));
            if (el) {
                el.child('div.name', true).innerHTML = rec.get('hostname');
                el.child('div.mem', true).innerHTML = rec.get('memory');
                el.child('span.uptime', true).innerHTML = Ext.getCmp('vmmap').getUptime(rec);
                el.child('span.cores', true).innerHTML = rec.get('num_cores');
            }
        }
    },

    onMouseClick: function(e, el) {
        el = Ext.get(el);
        if (!el) {
            return;
        }
        if (el.hasCls('node-cell')) {
            if (el.hasCls('free')) {
                return;
            }
        } else {
            el = el.up('div.node-cell:not(.free)');
            if (!el) {
                return;
            }
        }

        if (e.shiftKey) {
            var from = this.lastSelectedCell || this.el.down('div.node-cell:not(.free)'),
                allCells = Ext.select('div.node-cell:not(.free)', true, this.el.dom),
                to = allCells.indexOf(el);

            from = allCells.indexOf(from);
            if (from > to) {
                var temp = from;
                from = to;
                to = temp;
            }

            if (!e.ctrlKey) {
                this.selectedCells.each(function(cell) {
                    var i = allCells.indexOf(cell);
                    if (i < from || i > to) {
                        cell.removeCls('selected');
                    }
                });
                this.selectedCells.clear();
            }

            var i, item;
            for (i = from; i <= to; i++) {
                item = allCells.item(i);
                this.selectedCells.add(item);
                item.addCls('selected');
            }

        } else if (e.ctrlKey) {
            if (el.hasCls('selected')) {
                el.removeCls('selected');
                this.selectedCells.remove(el);
            } else {
                el.addCls('selected');
                this.selectedCells.add(el);
            }

            this.lastSelectedCell = el;

        } else {
            this.selectedCells.each(function(cell) {
                if (cell !== el) {
                    cell.removeCls('selected');
                }
            });
            this.selectedCells.clear();
            this.selectedCells.add(el);
            el.addCls('selected');

            this.lastSelectedCell = el;
        }
        
        var toolbar = Ext.getCmp('vmmap').getDockedComponent('toolbar'),
            group = toolbar.getComponent('group');
        if (this.selectedCells.getCount() > 0) {
            group.enable();
        } else {
            group.disable();
        }
    },

    onGroupClick: function() {
        this.cellList = "";
        this.selectedCells.each(function(cell) {
            this.cellList += cell.id + '<br>';
        }, this);
        Ext.Msg.alert('Group', this.cellList);
    },

    onResizeClick: function() {
    },

    onMigrateClick: function(button) {
        this.migrateMode = !this.migrateMode;
        button.setText(this.migrateMode ? 'Disable Migration' : 'Migrate');

        if (this.migrateMode) {
            this.dragZone = new Ext.dd.DragZone(this.getEl(), {
                getDragData: function(e) {
                    var cell = e.getTarget('div.node-cell:not(.free)');
                    if (cell) {
                        var clone = cell.cloneNode(true);
                        clone.id = Ext.id();
                        return {
                            ddel: clone,
                            sourceEl: cell,
                            repairXY: Ext.fly(cell).getXY(),
                            dragSource: this
                        }
                    }
                },

                getRepairXY: function() {
                    return this.dragData.repairXY;
                }
            });
        } else {
            this.dragZone.unreg();
            delete this.dragZone;
        }
    }
});