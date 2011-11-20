Ext.define('opennodeconsole.view.compute.NewVmView', {
    extend: 'Ext.window.Window',
    alias: 'widget.newcompute',

    title: 'New Virtual Machine',
    modal: true,
    border: false,
    width: 300,
    resizable: false,

    defaults: {
        border: false,
        bodyStyle: 'background: inherit',
        bodyPadding: 4
    },

    initComponent: function() {
        this.items = {
            xtype: 'form',
            items: [{
                xtype: 'fieldset',
                items: [// {
                //     fieldLabel: "Virtualization type",
                //     xtype: 'radiogroup',
                //     columns: 2,
                //     vertical: true,
                //     items: [
                //         {boxLabel: "OpenVZ", name: 'vtype', inputValue: 'openvz', checked: true},
                //         {boxLabel: "KVM", name: 'vtype', inputValue: 'kvm'},
                //     ]
                // },
                        {
                    fieldLabel: 'Template',
                    name: 'template',
                    xtype: 'combobox',
                    forceSelection: true,
                    store: this.parent.getList('templates'),
                    displayField: 'name_and_base_type',
                    queryMode: 'local'
                }]
            }, {
                xtype: 'fieldset',
                title: "Hardware parameters",
                frame: true,
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: [{
                    fieldLabel: "Memory/MB",
                    name: 'memory',
                    xtype: 'textfield',
                    value: '256',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    minValue: 128,
                    maxValue: 10240,
                    increment: 32,
                    value: 256,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "Nr. of CPUs",
                    name: 'num_cpus',
                    xtype: 'textfield',
                    value: '1',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    minValue: 1,
                    maxValue: 10,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "CPU Limit",
                    name: 'cpu',
                    xtype: 'textfield',
                    value: '1',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }, {
                    fieldLabel: "Disk Size/GB",
                    name: 'diskspace',
                    xtype: 'textfield',
                    value: '10',
                    width: 160
                }, {
                    xtype: 'slider',
                    width: 100,
                    minValue: 2,
                    maxValue: 1000,
                    value: 10,
                    listeners: {
                        'change': function(ev, newValue) {
                            this.previousSibling().setValue(newValue);
                        }
                    }
                }]
            }, {
                xtype: 'fieldset',
                title: "Network",
                items: [{
                    fieldLabel: "Network Type",
                    xtype: 'radiogroup',
                    columns: 2,
                    vertical: true,
                    items: [
                        {boxLabel: "VENET", name: 'network-type', inputValue: 'venet', checked: true},
                        {boxLabel: "VETH", name: 'network-type', inputValue: 'veth'},
                    ]
                }, {
                    fieldLabel: "Hostname",
                    name: 'hostname',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "IP Address",
                    name: 'ipv4_address',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 1",
                    name: 'dns1',
                    xtype: 'textfield'
                }, {
                    fieldLabel: "DNS 2",
                    name: 'dns2',
                    xtype: 'textfield'
                }]
            }, {
                xtype: 'fieldset',
                title: "Security",
                defaults: {
                    xtype: 'textfield',
                    inputType: 'password'
                },
                items: [{
                    fieldLabel: "Root Password",
                    name: 'root_passwrod'
                }, {
                    fieldLabel: "Root Password (repeat)",
                    name: 'root_passwrod_repeat'
                }]
            }, {
                xtype: 'checkbox',
                name: 'start_on_boot',
                fieldLabel: "Start on boot"
            }]
        };

        this.callParent(arguments);


        this.record = Ext.create('opennodeconsole.model.Compute', {});

        this.child('form').loadRecord(this.record);
    },

    dockedItems: {
        dock: 'bottom',
        frame: true,

        layout: {
            type: 'hbox',
            pack: 'end'
        },

        defaults: {
            xtype: 'button',
            margin: 2
        },

        items: [{
            text: 'Cancel' , handler: function() {
                this.up('window').destroy();
            }
        }, {
            text: 'Create'
        }]
    }
});
