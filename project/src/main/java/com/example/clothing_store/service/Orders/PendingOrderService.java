package com.example.clothing_store.service.Orders;

import com.example.clothing_store.dto.PendingOrderDTO;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class PendingOrderService {
    // Map< vnp_TxnRef, PendingOrderDTO >
    private final ConcurrentHashMap<String, PendingOrderDTO> store = new ConcurrentHashMap<>();

    public void save(String txnRef, PendingOrderDTO dto) {
        store.put(txnRef, dto);
    }

    public PendingOrderDTO get(String txnRef) {
        return store.get(txnRef);
    }

    public void remove(String txnRef) {
        store.remove(txnRef);
    }

}
