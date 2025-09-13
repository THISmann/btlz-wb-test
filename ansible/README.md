documentation

`` bash
ansible-playbook -i inventory/inventory.yml playbooks/deploy-api-key.yml --ask-vault-pass --ask-become-pass
``

#start ansible

`` bash
ansible-playbook -i inventory/inventory.yml playbooks/install-db.yml --ask-become-pass
``